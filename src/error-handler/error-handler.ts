import {
    AbstractControl, ControlContainer, FormArray, FormControl, FormGroup, NgControl, NgModel, NgModelGroup
} from '@angular/forms';
import { ArrayOrGroupAbstractControls, FormHelperDirective } from '../form-helper.directive';
import { arrayOfAbstractControls, splitClassNames, waitForControlInit } from '../utils';
import { AfterViewInit, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ControlBindElementDirective } from './control-bind-element.directive';
import { InputBoolean } from 'cmjs-lib';

export type RefType = string | NgModel | NgModelGroup;

export abstract class ErrorHandler implements AfterViewInit, OnInit {

    /**
     * 错误信息关联的表单控件
     *
     * 可用格式:
     * 1.string   -> name/ngModelGroup/formControlName/formGroupName/formArrayName
     * 2.control  -> 表单控件对象，通常为模板变量，如：#ctrl="ngModel/ngModelGroup"
     */
    @Input() ref: RefType;

    // 覆盖FormHelperConfig中配置
    // PS：参照物为关联的表单域，而不是错误消息自身
    @Input() scrollProxy: string;

    // 覆盖FormHelperConfig中配置
    @Input() @InputBoolean() validateImmediate: boolean;

    // 覆盖FormHelperConfig中配置
    @Input() @InputBoolean() validateImmediateDescendants: boolean;

    controlName: string;
    controlElement: Element;
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

    hasError(validator: string) {
        if (!this.control || !this.control.errors || !validator) {
            return false;
        } else {
            return this.control.errors[ validator ];
        }
    }

    /**
     * 替换消息中的占位符，上下文为错误返回对象(如果有)
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

    whenValid?(): void;

    whenInvalid?(): void;

    whenPending?(): void;

    reposition?(): void;

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