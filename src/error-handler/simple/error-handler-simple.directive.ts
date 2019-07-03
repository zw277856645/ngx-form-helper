import {
    AfterViewInit, Directive, ElementRef, Inject, InjectionToken, Input, Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { FormHelperDirective } from '../../form-helper.directive';
import { arrayProviderFactory } from '../../utils';
import { ErrorHandlerSimpleConfig } from './error-handler-simple-config';
import {
    FormArray, FormArrayName, FormControl, FormControlName,
    FormGroup, FormGroupName, NgModel, NgModelGroup
} from '@angular/forms';

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

    private initCount = 0;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() private model: NgModel,
                @Optional() private group: NgModelGroup,
                @Optional() private formCtrl: FormControl,
                @Optional() private formGroup: FormGroup,
                @Optional() private formArray: FormArray,
                @Optional() private formCtrlName: FormControlName,
                @Optional() private formGroupName: FormGroupName,
                @Optional() private formArrayName: FormArrayName,
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
        let templateCtrl = this.model || this.group;
        let modelCtrl = this.formCtrl || this.formGroup || this.formArray;
        let modelCtrlName = this.formCtrlName || this.formGroupName || this.formArrayName;

        if (templateCtrl) {
            this._control = templateCtrl.control;
            this.setNameByControl(this._control);
        } else if (modelCtrl) {
            this._control = modelCtrl;
            this.setNameByControl(this._control);
        } else if (modelCtrlName) {
            this._control = modelCtrlName.control;
            this.controlName = modelCtrlName.name;
        }

        // ngModelGroup需要时间初始化controls，每次等一个周期再执行
        if (!this._control) {
            this.initCount++;
            if (this.initCount <= 10) {
                setTimeout(() => this.initControlByDI());
            }
        } else {
            super.ngAfterViewInit();
        }
    }
}