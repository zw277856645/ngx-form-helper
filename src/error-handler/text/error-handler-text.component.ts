import {
    Component, ElementRef, HostBinding, Inject, InjectionToken, Input, OnInit, Optional, Provider,
    Renderer2, SkipSelf, ViewChild
} from '@angular/core';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { arrayProviderFactory, loadMessagesFromDataset } from '../../utils';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorHandler } from '../error-handler';
import { ErrorMessage } from '../error-message';

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
export class ErrorHandlerTextComponent extends ErrorHandler implements OnInit {

    @ViewChild('container') containerRef: ElementRef;

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

    messages: ErrorMessage[] = [];

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
        this.messages = loadMessagesFromDataset(this.element as HTMLElement);
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

    trackByMessages(i: number, msg: ErrorMessage) {
        return msg.error;
    }

}