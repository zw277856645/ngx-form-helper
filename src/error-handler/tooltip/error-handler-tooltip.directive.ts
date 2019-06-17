import {
    Directive, ElementRef, forwardRef, Inject, InjectionToken, Input, Optional, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { FormGroup, NgModel, NgModelGroup } from '@angular/forms';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorHandlerTooltipConfig } from './error-handler-tooltip-config';
import { isVisible } from 'cmjs-lib';

export const ERROR_HANDLER_TOOLTIP_CONFIG
    = new InjectionToken<ErrorHandlerTooltipConfig>('error_handler_tooltip_config');

@Directive({
    selector: '[ehTooltip][ngModel], [ehTooltip][ngModelGroup]',
    exportAs: 'ehTooltip',
    providers: [
        {
            provide: ErrorHandler,
            useExisting: forwardRef(() => ErrorHandlerTooltipDirective)
        }
    ]
})
export class ErrorHandlerTooltipDirective extends ErrorHandler {

    @Input() positionProxy: string;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() private ngModel: NgModel,
                @Optional() private ngModelGroup: NgModelGroup,
                @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TOOLTIP_CONFIG) private overrideConfig: ErrorHandlerTooltipConfig) {
        super(eleRef, ngModel || ngModelGroup, formHelper, renderer);
        Object.assign(this, overrideConfig);
    }

    whenValid() {
        if (this.messageHandler) {
            this.messageHandler.whenValid();
        }
    }

    whenInvalid() {
        if (this.messageHandler) {
            this.messageHandler.whenInvalid();
        }
    }

    whenPending() {
        if (this.messageHandler && this.messageHandler.whenPending) {
            this.messageHandler.whenPending();
        }
    }

    repositionMessages(delay?: number) {
        if (this.messageHandler && this.messageHandler.reposition) {
            if (isVisible(this.messageHandler.element)) {
                this.messageHandler.reposition();
            } else {
                setTimeout(() => this.messageHandler.reposition(), delay || 0);
            }
        }

        // 继续重定位后代错误消息
        if (this.control instanceof FormGroup) {
            for (let name in this.control.controls) {
                let childHandler = this.formHelper.errorHandlers.find(eh => {
                    return eh.control === (this.control as FormGroup).controls[ name ];
                });

                if (childHandler
                    && childHandler instanceof ErrorHandlerTooltipDirective
                    && childHandler.repositionMessages) {
                    childHandler.repositionMessages(delay);
                }
            }
        }
    }

}