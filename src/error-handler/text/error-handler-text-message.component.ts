import {
    Component, ElementRef, HostBinding, Inject, InjectionToken, Input, OnInit, Optional, Renderer2,
    SkipSelf, ViewChild
} from '@angular/core';
import { ErrorHandlerTextMessageConfig } from './error-handler-text-message-config';
import { loadMessagesFromDataset } from '../../utils';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorMessage } from '../error-message';
import { ErrorMessageHandler } from '../error-message-handler';

export const ERROR_HANDLER_TEXT_MSG_CONFIG
    = new InjectionToken<ErrorHandlerTextMessageConfig>('error_handler_text_msg_config');

@Component({
    selector: 'eh-text-message',
    templateUrl: './error-handler-text-message.component.html',
    styleUrls: [ './error-handler-text-message.component.less' ]
})
export class ErrorHandlerTextMessageComponent extends ErrorMessageHandler implements OnInit {

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

    // 当消息在form外部时有用，使用此属性关联formHelper实例
    @Input() refForm: FormHelperDirective;

    messages: ErrorMessage[] = [];

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private fhCtrl: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TEXT_MSG_CONFIG)
                private overrideConfig: ErrorHandlerTextMessageConfig) {
        super(eleRef, renderer);
        Object.assign(this, overrideConfig);
    }

    ngOnInit() {
        super.addClasses(this.element, this.classNames);
        this.messages = loadMessagesFromDataset(this.element as HTMLElement);
    }

    whenValid() {
        this.visible = false;

        if (this.containerRef && this.animation) {
            super.removeClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    whenInvalid() {
        this.visible = true;

        if (this.containerRef && this.animation) {
            super.addClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    whenPending() {
        this.whenValid();
    }

    trackByMessages(i: number, msg: ErrorMessage) {
        return msg.validator;
    }

    get formHelper() {
        return this.fhCtrl || this.refForm;
    }

}