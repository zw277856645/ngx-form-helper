import { AfterViewInit, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormHelperDirective } from '../form-helper.directive';
import { AbstractControl, FormControl, NgModel, NgModelGroup } from '@angular/forms';
import { splitClassNames } from '../utils';
import { ErrorMessageHandler } from './error-message-handler';

export abstract class ErrorHandler implements OnInit, AfterViewInit {

    @Input() scrollProxy: string;

    @Input() validateImmediate: boolean;

    // 同form全局配置累加
    @Input() errorClassNames: string;

    // 同form全局配置累加
    @Input() errorGroupClassNames: string;

    element: Element;
    control: AbstractControl;

    private _messageHandler: ErrorMessageHandler;

    private readonly _formHelper: FormHelperDirective;
    private readonly _modelOrGroup: NgModel | NgModelGroup;
    private readonly _renderer: Renderer2;

    protected constructor(
        eleRef: ElementRef,
        modelOrGroup: NgModel | NgModelGroup,
        formHelper: FormHelperDirective,
        renderer: Renderer2) {
        this.element = eleRef.nativeElement;
        this._modelOrGroup = modelOrGroup;
        this._formHelper = formHelper;
        this._renderer = renderer;

        if (modelOrGroup instanceof NgModel) {
            this.control = modelOrGroup.control;
        } else {
            setTimeout(() => this.control = modelOrGroup.control);
        }
    }

    // 优先使用自身的配置，否则使用form的配置
    // PS: 子元素的ngOnInit在父元素ngOnInit后执行
    ngOnInit() {
        if (this.validateImmediate === undefined || this.validateImmediate === null) {
            this.validateImmediate = this._formHelper.validateImmediate;
        }
        if (this.scrollProxy === undefined || this.scrollProxy === null) {
            this.scrollProxy = this._formHelper.scrollProxy;
        }
    }

    ngAfterViewInit() {
        if (this._modelOrGroup instanceof NgModel) {
            this.listenStatusChanges();
        } else {
            // 等待NgModelGroup初始化完毕
            setTimeout(() => this.listenStatusChanges());
        }

        if (this.validateImmediate) {
            this.control.markAsDirty();
            this.control.updateValueAndValidity();
        }
    }

    set messageHandler(messageHandler: ErrorMessageHandler) {
        this._messageHandler = messageHandler;

        if (this.validateImmediate) {
            this.control.updateValueAndValidity();
        }
    }

    get messageHandler() {
        return this._messageHandler;
    }

    protected addClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.addClass(ele, cls));
    }

    protected removeClasses(ele: Element, classNames: string | boolean) {
        splitClassNames(classNames).forEach(cls => this._renderer.removeClass(ele, cls));
    }

    private listenStatusChanges() {
        this.control.statusChanges.subscribe(() => {
            if (this.control.pending) {
                // 系统内置处理
                this.removeAllClasses();

                // 用户自定义处理
                if (this.whenPending) {
                    this.whenPending();
                }
            }

            if (!this.control.pending) {
                // 系统内置处理
                if (this.control.disabled || this.control.pristine || this.control.valid) {
                    this.removeAllClasses();
                } else if (this.control.dirty && this.control.invalid) {
                    this.addAllClasses();
                }

                // 用户自定义处理
                if (this.control.enabled && this.control.dirty) {
                    if (this.control.valid) {
                        this.whenValid();
                    } else if (this.control.invalid) {
                        this.whenInvalid();
                    }
                }
            }
        });
    }

    abstract whenValid(): void;

    abstract whenInvalid(): void;

    whenPending?(): void;

    private addAllClasses() {
        if (this.control instanceof FormControl) {
            this.addClasses(this.element, this._formHelper.errorClassNames);
            this.addClasses(this.element, this.errorClassNames);
        } else {
            this.addClasses(this.element, this._formHelper.errorGroupClassNames);
            this.addClasses(this.element, this.errorGroupClassNames);
        }
    }

    private removeAllClasses() {
        if (this.control instanceof FormControl) {
            this.removeClasses(this.element, this._formHelper.errorClassNames);
            this.removeClasses(this.element, this.errorClassNames);
        } else {
            this.removeClasses(this.element, this._formHelper.errorGroupClassNames);
            this.removeClasses(this.element, this.errorGroupClassNames);
        }
    }

}
