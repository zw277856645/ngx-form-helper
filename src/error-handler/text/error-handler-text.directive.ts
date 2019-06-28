import {
    Directive, ElementRef, forwardRef, Inject, InjectionToken, Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { FormHelperDirective } from '../../form-helper.directive';
import { NgModel, NgModelGroup } from '@angular/forms';
import { arrayProviderFactory } from '../../utils';

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
            deps: [ ERROR_HANDLER_TEXT_CONFIG, [ new SkipSelf(), new Optional(), ERROR_HANDLER_TEXT_CONFIG_ARRAY ] ]
        }
    ];
}

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
                @Optional() @Inject(ERROR_HANDLER_TEXT_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTextConfig[]) {
        super(eleRef, ngModel || ngModelGroup, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
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