import {
    AfterViewInit, Directive, ElementRef, Inject, InjectionToken, Input, Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { FormHelperDirective } from '../../form-helper.directive';
import { arrayProviderFactory, waitForControlInit } from '../../utils';
import { ErrorHandlerSimpleConfig } from './error-handler-simple-config';
import { ControlContainer, NgControl } from '@angular/forms';

export const ERROR_HANDLER_SIMPLE_CONFIG
    = new InjectionToken<ErrorHandlerSimpleConfig>('error_handler_simple_config');

export const ERROR_HANDLER_SIMPLE_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerSimpleConfig[]>('error_handler_simple_config_array');

export function errorHandlerSimpleConfigProvider(config: ErrorHandlerSimpleConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_SIMPLE_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_SIMPLE_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_SIMPLE_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_SIMPLE_CONFIG_ARRAY ]
            ]
        }
    ];
}

@Directive({
    selector: '[ehSimple]',
    providers: [
        {
            provide: ErrorHandler,
            useExisting: ErrorHandlerSimpleDirective
        }
    ],
    exportAs: 'ehSimple'
})
export class ErrorHandlerSimpleDirective extends ErrorHandler implements AfterViewInit {

    @Input() errorClassNames: string | false = 'eh-simple-error';

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() private ngControl: NgControl,
                @Optional() private controlContainer: ControlContainer,
                @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_SIMPLE_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerSimpleConfig[]) {
        super(eleRef, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngAfterViewInit() {
        // 省略ref时，从DI系统解析关联的控件
        if (this.ref === null || this.ref === undefined) {
            setTimeout(() => this.initControlByDI());
        } else {
            super.ngAfterViewInit();
        }
    }

    whenValid() {
        this.removeClasses(this.eleRef.nativeElement, this.errorClassNames);
    }

    whenInvalid() {
        this.addClasses(this.eleRef.nativeElement, this.errorClassNames);
    }

    whenPending() {
        this.whenValid();
    }

    repositionMessages(delay?: number) {
        if (this.control) {
            this.formHelper.repositionMessages(this.control, delay);
        }
    }

    private initControlByDI() {
        let finalControl = this.ngControl || this.controlContainer;

        if (finalControl) {
            this.controlName = finalControl.name;
        }

        waitForControlInit(finalControl).subscribe(ctrl => {
            if (ctrl) {
                this._control = ctrl;
                super.ngAfterViewInit();
            }
        });
    }
}