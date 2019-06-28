import {
    Directive, ElementRef, forwardRef, Host, Inject, InjectionToken, Input, Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { FormGroup, NG_ASYNC_VALIDATORS, NgModel, NgModelGroup, Validator } from '@angular/forms';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorHandlerTooltipConfig } from './error-handler-tooltip-config';
import { isVisible } from 'cmjs-lib';
import { arrayProviderFactory } from '../../utils';

export const ERROR_HANDLER_TOOLTIP_CONFIG
    = new InjectionToken<ErrorHandlerTooltipConfig>('error_handler_tooltip_config');

export const ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTooltipConfig[]>('error_handler_tooltip_config_array');

export function errorHandlerTooltipConfigProvider(config: ErrorHandlerTooltipConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TOOLTIP_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY ]
            ]
        }
    ];
}

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
                @Optional() @Inject(ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTooltipConfig[],
                @Host() @Optional() @Inject(NG_ASYNC_VALIDATORS) public asyncValidators: (Function | Validator)[]) {
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