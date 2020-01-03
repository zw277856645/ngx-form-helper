import {
    AbstractControl, ControlContainer, FormArray, FormControl, FormGroup, NgControl, NgModel, NgModelGroup
} from '@angular/forms';
import { ArrayOrGroupAbstractControls, FormHelperDirective } from '../form-helper.directive';
import { arrayOfAbstractControls, splitClassNames, waitForControlInit } from '../utils';
import { AfterViewInit, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ControlBindElementDirective } from './control-bind-element.directive';
import { InputBoolean } from '@demacia/cmjs-lib';

/**
 * 控件引用类型，[参见]{@link ErrorHandler#ref}
 */
export type RefType = string | NgModel | NgModelGroup;

/**
 * 错误处理组件基类，可继承此类实现自定义错误处理组件，内部已实现功能如下：
 *
 * - 根据 [ref]{@link #ref} 输入属性自动关联表单域/表单组
 * - 关联表单域/表单组成功后触发 [onControlPrepared]{@link #onControlPrepared} 回调，该回调由继承类实现
 * - 自带 [scrollProxy]{@link #scrollProxy}、[validateImmediate]{@link #validateImmediate}、
 * [validateImmediateDescendants]{@link #validateImmediateDescendants} 输入属性，
 * 并覆盖[formHelper]{@link FormHelperDirective}中相应属性
 * - 监听控件状态，自动触发 [whenValid]{@link #whenValid}、[whenInvalid]{@link #whenInvalid}、
 * [whenPending]{@link #whenPending} 回调，这些回调由继承类实现
 * - 继承类如果实现了 [reposition]{@link #reposition} 回调，插件会在 window:resize 事件中自动调用
 * - 内置 [hasError]{@link #hasError} 方法，简化错误判断
 * - 内置 [compileMessage]{@link #compileMessage} 方法，根据指定上下文替换消息中的占位符
 *
 * ~~~ js
 * // 自定义消息处理组件
 * export class ErrorHandlerXxxComponent extends ErrorHandler implements AfterViewInit, OnInit {
 *
 *     ngOnInit() {
 *         super.ngOnInit();
 *
 *         // do something
 *     }
 *
 *     ngAfterViewInit() {
 *         super.ngAfterViewInit();
 *
 *         // do something
 *     }
 *
 *     whenValid() {
 *         // do something
 *     }
 *
 *     whenInvalid() {
 *         // do something
 *     }
 *
 *     whenPending() {
 *         // do something
 *     }
 *
 *     reposition() {
 *         // do something
 *     }
 *
 *     onControlPrepared() {
 *         // do something
 *     }
 * }
 * ~~~
 */
export abstract class ErrorHandler implements AfterViewInit, OnInit {

    /**
     * 错误信息关联的表单控件
     *
     * ---
     *
     * **可用格式:**
     *
     * 1.控件名称方式（name/ngModelGroup/formControlName/formGroupName/formArrayName）
     *
     * ~~~ html
     * <!-- ngModel name -->
     * <input type="text" name="name" [(ngModel)]="xxx">
     * <eh-text ref="name"></eh-text>
     *
     * <!-- ngModelGroup name -->
     * <div ngModelGroup="name"></div>
     * <eh-text ref="name"></eh-text>
     *
     * <!-- formControlName name -->
     * <input type="text" formControlName="name">
     * <eh-text ref="name"></eh-text>
     *
     * <!-- formGroupName / formArrayName name -->
     * <div formGroupName="name"></div>
     * <eh-text ref="name"></eh-text>
     * ~~~
     *
     * 2.控件对象方式（表单控件对象，通常为模板变量，如：#ctrl="ngModel/ngModelGroup"）
     *
     * ~~~ html
     * <!-- ngModel control -->
     * <input type="text" name="name" [(ngModel)]="xxx" #ctrl="ngModel">
     * <eh-text [ref]="ctrl"></eh-text>
     *
     * <!-- ngModelGroup control -->
     * <div ngModelGroup="name" #ctrl="ngModelGroup"></div>
     * <eh-text [ref]="ctrl"></eh-text>
     * ~~~
     */
    @Input() ref: RefType;

    /**
     * 覆盖 [FormHelperConfig]{@link FormHelperDirective#scrollProxy} 中配置
     *
     * - 参照物为关联的表单域，而不是错误消息自身
     */
    @Input() scrollProxy: string;

    /**
     * 覆盖 [FormHelperConfig]{@link FormHelperDirective#validateImmediate} 中配置
     */
    @Input() @InputBoolean() validateImmediate: boolean;

    /**
     * 覆盖 [FormHelperConfig]{@link FormHelperDirective#validateImmediateDescendants} 中配置
     */
    @Input() @InputBoolean() validateImmediateDescendants: boolean;

    /**
     * 关联的表单控件名称（name/ngModelGroup/formControlName/formGroupName/formArrayName）
     */
    controlName: string;

    /**
     * 关联的表单控件DOM对象
     */
    controlElement: Element;

    /**
     * 错误处理组件DOM对象
     */
    element: Element;

    protected _control: AbstractControl;

    protected constructor(private _eleRef: ElementRef,
                          private _formHelper: FormHelperDirective,
                          private _renderer: Renderer2) {
        this.element = _eleRef.nativeElement;
    }

    ngOnInit() {
        if (this.scrollProxy === undefined || this.scrollProxy === null) {
            this.scrollProxy = this._formHelper.scrollProxy;
        }
        if (this.validateImmediate === undefined || this.validateImmediate === null) {
            this.validateImmediate = this._formHelper.validateImmediate;
        }
        if (this.validateImmediateDescendants === undefined || this.validateImmediateDescendants === null) {
            this.validateImmediateDescendants = this._formHelper.validateImmediateDescendants;
        }
    }

    ngAfterViewInit() {
        // setTimeout保证动态表单正确绑定
        setTimeout(() => {
            waitForControlInit(() => this.control).subscribe(ctrl => {
                if (ctrl) {
                    // 踩坑记录
                    // 起先使用的是根据属性名dom查询的方式，如：document.querySelector('[name=xxx]')，但在
                    // 用户使用了模板变量的形式，如：[name]="name"，[formControlName]="name"的情况下不会生成 ng-reflect-name，
                    // angular 在 prod 模式下 @Input 不会生成 ng-reflect-* 属性
                    this.controlElement = ctrl[ ControlBindElementDirective.ELEMENT_BIND_KEY ];

                    if (this.onControlPrepared) {
                        this.onControlPrepared();
                    }

                    this.listenStatusChanges();
                }
            });
        });
    }

    /**
     * 获取某验证规则是否发生错误
     *
     * @param validator 规则名称
     */
    hasError(validator: string) {
        if (!this.control || !this.control.errors || !validator) {
            return false;
        } else {
            return this.control.errors[ validator ];
        }
    }

    /**
     * 替换消息中的占位符，上下文为错误返回对象(如果有)
     *
     * @param context 上下文
     * @param message 消息占位符
     */
    compileMessage(context: any, message: string) {
        if (context !== null && typeof context === 'object') {
            let reg = /{{.*?}}/g;
            let find: RegExpExecArray | null;
            let parsedMessage = '';
            let lastIndex = 0;

            while ((find = reg.exec(message))) {
                parsedMessage += message.substring(lastIndex, find.index);
                parsedMessage += context[ find[ 0 ].replace('{{', '').replace('}}', '') ];
                lastIndex = find.index + find[ 0 ].length;
            }

            parsedMessage += message.substring(lastIndex);

            return parsedMessage;
        }

        return message;
    }

    /**
     * 获取 [ref]{@link #ref} 关联的控件
     */
    get control() {
        if (!this._control && this.ref) {
            if (this._formHelper && typeof this.ref === 'string') {
                this._control = this.findControlByName(this.ref);
                this.controlName = this.ref;
            } else if (this.ref instanceof NgControl || this.ref instanceof ControlContainer) {
                this._control = this.ref.control;
                this.controlName = this.ref.name;
            }
        }

        return this._control;
    }

    /**
     * 验证成功回调
     */
    whenValid?(): void;

    /**
     * 验证失败回调
     */
    whenInvalid?(): void;

    /**
     * 处于验证中时的回调
     */
    whenPending?(): void;

    /**
     * 消息定位
     *
     * - 通常在每次 whenInvalid 时调用一次，防止页面布局变化导致绝对定位消息显示位置不准确
     * - window:resize 事件自动调用
     */
    reposition?(): void;

    /**
     * [ref]{@link #ref} 关联的控件初始化完成回调
     *
     * - 消息处理组件关联表单域/表单组是由基类自动完成的，可根据需要在关联成功后执行一些操作
     */
    onControlPrepared?(): void;

    protected addClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this._renderer.addClass(ele, cls));
    }

    protected removeClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this._renderer.removeClass(ele, cls));
    }

    private findControlByName(
        name: string,
        controls: ArrayOrGroupAbstractControls = this._formHelper.controls
    ): AbstractControl {
        if (controls) {
            let arrayControls = arrayOfAbstractControls(controls);

            for (let item of arrayControls) {
                if (item.name === name) {
                    return item.control;
                }
            }

            // 当前group下没有找到，从group中的group继续寻找
            for (let item of arrayControls) {
                if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                    let find = this.findControlByName(name, item.control.controls);
                    if (find) {
                        return find;
                    }
                }
            }
        }

        return null;
    }

    private listenStatusChanges() {
        this.control.statusChanges.subscribe(() => {
            if (this.control.pending) {
                // 系统内置处理
                this.removeControlEleClasses();

                // 用户自定义处理
                if (this.whenPending) {
                    this.whenPending();
                }
            }

            if (!this.control.pending) {
                // 系统内置处理
                if (this.control.disabled || this.control.pristine || this.control.valid) {
                    this.removeControlEleClasses();
                } else if (this.control.dirty && this.control.invalid) {
                    this.addControlEleClasses();
                }

                // 用户自定义处理
                if (this.control.enabled && this.control.dirty) {
                    if (this.control.valid && this.whenValid) {
                        this.whenValid();
                    } else if (this.control.invalid && this.whenInvalid) {
                        this.whenInvalid();
                    }
                }
            }
        });

        if (this.validateImmediate) {
            this.control.markAsDirty();
            this.control.updateValueAndValidity();

            if (this.validateImmediateDescendants
                && (this.control instanceof FormGroup || this.control instanceof FormArray)) {
                this.validateControls(this.control.controls);
            }
        }
    }

    private validateControls(controls: ArrayOrGroupAbstractControls) {
        setTimeout(() => {
            arrayOfAbstractControls(controls).forEach(item => {
                item.control.markAsDirty({ onlySelf: true });
                item.control.updateValueAndValidity({ onlySelf: true });

                if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                    this.validateControls(item.control.controls);
                }
            });
        });
    }

    private addControlEleClasses() {
        if (this.controlElement) {
            if (this.control instanceof FormControl) {
                this.addClasses(this.controlElement, this._formHelper.errorClassNames);
            } else {
                this.addClasses(this.controlElement, this._formHelper.errorGroupClassNames);
            }
        }
    }

    private removeControlEleClasses() {
        if (this.controlElement) {
            if (this.control instanceof FormControl) {
                this.removeClasses(this.controlElement, this._formHelper.errorClassNames);
            } else {
                this.removeClasses(this.controlElement, this._formHelper.errorGroupClassNames);
            }
        }
    }

}