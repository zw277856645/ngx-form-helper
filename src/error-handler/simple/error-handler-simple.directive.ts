import {
    AfterViewInit, Directive, ElementRef, Inject, InjectionToken, Input, Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { FormHelperDirective } from '../../form-helper.directive';
import { arrayProviderFactory, waitForControlInit } from '../../utils';
import { ErrorHandlerSimpleConfig } from './error-handler-simple-config';
import { ControlContainer, NgControl } from '@angular/forms';

/**
 * @ignore
 */
export const ERROR_HANDLER_SIMPLE_CONFIG
    = new InjectionToken<ErrorHandlerSimpleConfig>('error_handler_simple_config');

/**
 * @ignore
 */
export const ERROR_HANDLER_SIMPLE_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerSimpleConfig[]>('error_handler_simple_config_array');

/**
 * [ErrorHandlerSimpleDirective]{@link ErrorHandlerSimpleDirective} 全局配置
 *
 * ~~~ js
 * \@NgModule({
 *     ...
 *     providers: [
 *         errorHandlerSimpleConfigProvider({
 *             errorClassNames: 'eh-simple-error my-special-style'
 *             ...
 *         })
 *     ]
 * })
 * export class CoreModule {
 * }
 * ~~~
 *
 * @param config 配置
 */
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

/**
 * 作用：标记任意元素为错误处理控件<br>
 * 特色：没有错误消息，仅被标记的控件自身和对应的表单域/表单组有反馈
 *
 * ---
 *
 * 作用在任意元素，引用表单域/表单组。此方式与
 * [eh-text]{@link ErrorHandlerTextComponent} / [eh-tooltip]{@link ErrorHandlerTooltipComponent} 相同
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <div ehSimple ref="name"></div>
 * ~~~
 *
 * 作用在表单域/表单组上，此情况不需要设置 ref 属性
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*" ehSimple>
 * ~~~
 */
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

    /**
     * 验证失败时自身自动添加的类名
     */
    @Input() errorClassNames: string = 'eh-simple-error';

    /**
     * @ignore
     */
    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() private ngControl: NgControl,
                @Optional() private controlContainer: ControlContainer,
                @SkipSelf() private formHelper: FormHelperDirective,
                // tslint:disable-next-line:prefer-inline-decorator
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

    /**
     * @ignore
     */
    whenValid() {
        this.removeClasses(this.eleRef.nativeElement, this.errorClassNames);
    }

    /**
     * @ignore
     */
    whenInvalid() {
        this.addClasses(this.eleRef.nativeElement, this.errorClassNames);
    }

    /**
     * @ignore
     */
    whenPending() {
        this.whenValid();
    }

    /**
     * 错误消息重定位，当关联控件为`表单组`时，其`子域`也会同时重定位
     *
     * @param delay 延时重定位时间
     */
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