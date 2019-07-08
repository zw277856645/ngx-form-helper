import {
    Component, ElementRef, HostBinding, Inject, InjectionToken, Input, OnChanges, OnInit, Optional, Provider,
    Renderer2, SimpleChanges, SkipSelf, ViewChild
} from '@angular/core';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { arrayProviderFactory } from '../../utils';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorHandler } from '../error-handler';
import { TextMessage } from './text-message';

export const ERROR_HANDLER_TEXT_CONFIG
    = new InjectionToken<ErrorHandlerTextConfig>('error_handler_text_config');

export const ERROR_HANDLER_TEXT_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTextConfig[]>('error_handler_text_config_array');

export function errorHandlerTextConfigProvider(config: ErrorHandlerTextConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TEXT_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TEXT_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TEXT_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TEXT_CONFIG_ARRAY ]
            ]
        }
    ];
}

@Component({
    selector: 'eh-text',
    templateUrl: './error-handler-text.component.html',
    styleUrls: [ './error-handler-text.component.less' ],
    providers: [
        {
            provide: ErrorHandler,
            useExisting: ErrorHandlerTextComponent
        }
    ],
    exportAs: 'ehText'
})
export class ErrorHandlerTextComponent extends ErrorHandler implements OnInit, OnChanges {

    @ViewChild('container') containerRef: ElementRef;

    @Input() errorMessages: TextMessage[] | { [ error: string ]: string };

    @Input() classNames: string | false = 'eh-text-theme';

    @Input() animation: string;

    @HostBinding('class.inline') @Input() inline: boolean = true;

    @HostBinding('class.float') @Input() float: boolean;

    @HostBinding('class.right') @Input() right: boolean;

    @HostBinding('style.font-size.px') @Input() fontSize: number = 13;

    @HostBinding('style.left.px') @Input() offsetX: number = 0;

    @HostBinding('style.top.px') @Input() offsetY: number = 0;

    // 消息显示/隐藏
    @HostBinding('class.visible') visible: boolean;

    messages: TextMessage[];

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TEXT_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTextConfig[]) {
        super(eleRef, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngOnInit() {
        super.ngOnInit();

        this.addClasses(this.element, this.classNames);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errorMessages) {
            this.messages = ErrorHandlerTextComponent.convertErrorMessages2Array(this.errorMessages);
        }
    }

    whenValid() {
        this.visible = false;

        if (this.containerRef && this.animation) {
            this.removeClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    whenInvalid() {
        this.visible = true;

        if (this.containerRef && this.animation) {
            this.addClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    whenPending() {
        this.whenValid();
    }

    trackByMessages(i: number, msg: TextMessage) {
        return msg.error;
    }

    private static convertErrorMessages2Array(messages: TextMessage[] | { [ error: string ]: string }) {
        let parsedMessages: TextMessage[] = [];

        if (Array.isArray(messages)) {
            parsedMessages = messages || parsedMessages;
        } else if (messages !== null && typeof messages === 'object') {
            for (let error in messages) {
                parsedMessages.push({ error, message: messages[ error ] });
            }
        }

        return parsedMessages;
    }

}