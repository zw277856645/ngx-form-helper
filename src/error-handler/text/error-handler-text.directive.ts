import {
    Directive, ElementRef, forwardRef, Inject, InjectionToken, Optional, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { FormHelperDirective } from '../../form-helper.directive';
import { NgModel, NgModelGroup } from '@angular/forms';

export const ERROR_HANDLER_TEXT_CONFIG = new InjectionToken<ErrorHandlerTextConfig>('error_handler_text_config');

@Directive({
    selector: '[ehText][ngModel], [ehText][ngModelGroup]',
    exportAs: 'ehText',
    providers: [
        {
            provide: ErrorHandler,
            useExisting: forwardRef(() => ErrorHandlerTextDirective)
        }
    ]
})
export class ErrorHandlerTextDirective extends ErrorHandler {

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() private ngModel: NgModel,
                @Optional() private ngModelGroup: NgModelGroup,
                @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TEXT_CONFIG) private overrideConfig: ErrorHandlerTextConfig) {
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

}