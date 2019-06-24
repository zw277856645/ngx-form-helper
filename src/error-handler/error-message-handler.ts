import { AbstractControl, FormGroup, NgModel, NgModelGroup } from '@angular/forms';
import { FormHelperDirective } from '../form-helper.directive';
import { splitClassNames } from '../utils';
import { AfterViewInit, ElementRef, Input, Renderer2 } from '@angular/core';
import { ErrorHandler } from './error-handler';

export abstract class ErrorMessageHandler implements AfterViewInit {

    // 错误信息关联的表单域/表单组
    // 可用格式: 1.string        -> 表单域name/表单组ngModelGroup值
    //          2.model/group   -> 表单域/表单组控件
    //          3.errorHandler  -> 错误处理指令
    // 未指定此配置将由用户自己定义消息内容
    @Input() ref: string | NgModel | NgModelGroup | ErrorHandler;

    controlName: string;
    errorHandler: ErrorHandler;
    element: Element;

    private initControlCount = 0;
    private _control: AbstractControl;

    private readonly _renderer: Renderer2;

    protected constructor(eleRef: ElementRef,
                          renderer: Renderer2) {
        this.element = eleRef.nativeElement;
        this._renderer = renderer;
    }

    ngAfterViewInit() {
        // setTimeout保证动态表单正确绑定
        setTimeout(() => this.bindErrorHandler());
    }

    protected addClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.addClass(ele, cls));
    }

    protected removeClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.removeClass(ele, cls));
    }

    hasError(validator: string) {
        if (!this.control || !this.control.errors) {
            return false;
        } else {
            return this.control.errors[ validator ];
        }
    }

    get control() {
        if (this._control) {
            return this._control;
        } else {
            if (this.formHelper && typeof this.ref === 'string') {
                return this.findControlByRef();
            } else if (this.ref instanceof NgModel || this.ref instanceof NgModelGroup) {
                return this.ref.control;
            } else if (this.ref instanceof ErrorHandler) {
                return this.ref.control;
            } else {
                return null;
            }
        }
    }

    abstract get formHelper(): FormHelperDirective;

    abstract whenValid(): void;

    abstract whenInvalid(): void;

    whenPending?(): void;

    reposition?(): void;

    private findControlByRef(
        controls: { [ key: string ]: AbstractControl } = this.formHelper.ngForm.controls
    ): AbstractControl {
        if (controls) {
            for (let name in controls) {
                if (name === this.ref as string) {
                    this.controlName = name;

                    return controls[ name ];
                }
            }

            // 当前group下没有找到，从group中的group继续寻找
            for (let name in controls) {
                if (controls[ name ] instanceof FormGroup) {
                    let find = this.findControlByRef((controls[ name ] as FormGroup).controls);
                    if (find) {
                        this.controlName = name;

                        return find;
                    }
                }
            }
        } else {
            return null;
        }
    }

    private bindErrorHandler() {
        if (!this.formHelper) {
            return;
        }

        // ngModelGroup需要时间初始化controls，每次等一个周期再执行
        if (!this.control) {
            this.initControlCount++;
            if (this.initControlCount <= 10) {
                setTimeout(() => this.bindErrorHandler());
            }
        } else {
            this.errorHandler = this.formHelper.errorHandlers.find(eh => eh.control === this.control);
            if (this.errorHandler) {
                this.errorHandler.messageHandler = this;
            }
        }
    }

}