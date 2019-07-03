import { AbstractControl, AbstractControlDirective, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ArrayOrGroupAbstractControls, FormHelperDirective } from '../form-helper.directive';
import { arrayOfAbstractControls, splitClassNames } from '../utils';
import { AfterViewInit, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

export type RefType = string | AbstractControlDirective | AbstractControl;

export abstract class ErrorHandler implements AfterViewInit, OnInit {

    /**
     * 错误信息关联的表单控件
     *
     * 可用格式:
     * 1.string   -> name/ngModelGroup/formControlName/formGroupName/formArrayName
     * 2.control  -> 表单控件对象，通常为模板变量，如：#ctrl="ngModel/ngModelGroup/formControl/formGroup/formArray"
     */
    @Input() ref: RefType;

    // 覆盖FormHelperConfig中配置
    // PS：参照物为关联的表单域，而不是错误消息自身
    @Input() scrollProxy: string;

    // 覆盖FormHelperConfig中配置
    @Input() validateImmediate: boolean;

    // 覆盖FormHelperConfig中配置
    @Input() validateImmediateDescendants: boolean;

    controlName: string;
    controlElement: Element;
    element: Element;

    protected _control: AbstractControl;

    private initControlCount = 0;

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
        setTimeout(() => this.prepareControl());
    }

    hasError(validator: string) {
        if (!this.control || !this.control.errors || !validator) {
            return false;
        } else {
            return this.control.errors[ validator ];
        }
    }

    get control() {
        if (!this._control && this.ref) {
            if (this._formHelper && typeof this.ref === 'string') {
                this._control = this.findControlByName(this.ref);
                this.controlName = this.ref;
            } else if (this.ref instanceof AbstractControlDirective) {
                this._control = this.ref.control;
                this.setNameByControl(this.ref.control);
            } else if (this.ref instanceof AbstractControl) {
                this._control = this.ref;
                this.setNameByControl(this.ref);
            }
        }

        return this._control;
    }

    whenValid?(): void;

    whenInvalid?(): void;

    whenPending?(): void;

    reposition?(): void;

    onControlPrepared?(): void;

    protected addClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.addClass(ele, cls));
    }

    protected removeClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.removeClass(ele, cls));
    }

    protected findControlByName(
        name: string,
        controls: ArrayOrGroupAbstractControls = this._formHelper.ngForm.controls
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

    protected setNameByControl(control: AbstractControl,
                               controls: ArrayOrGroupAbstractControls = this._formHelper.ngForm.controls) {
        if (control && controls) {
            let arrayControls = arrayOfAbstractControls(controls);

            for (let item of arrayControls) {
                if (item.control === control) {
                    return this.controlName = item.name;
                }
            }

            // 当前group下没有找到，从group中的group继续寻找
            for (let item of arrayControls) {
                if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                    this.setNameByControl(control, item.control.controls);
                }
            }
        }
    }

    private findControlElement() {
        if (!this.controlName) {
            return;
        }

        this.controlElement = this._formHelper.form.querySelector(`
            [name=${this.controlName}],
            [ngModelGroup=${this.controlName}],
            [formControlName=${this.controlName}],
            [formGroupName=${this.controlName}],
            [formArrayName=${this.controlName}]
        `);
    }

    private prepareControl() {
        // ngModelGroup需要时间初始化controls，每次等一个周期再执行
        if (!this.control) {
            this.initControlCount++;
            if (this.initControlCount <= 10) {
                setTimeout(() => this.prepareControl());
            }
        } else {
            this.findControlElement();

            if (this.onControlPrepared) {
                this.onControlPrepared();
            }

            this.listenStatusChanges();
        }
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