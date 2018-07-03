import { Input, ElementRef, Directive, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { AbstractControl, FormGroup, NgControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/take';
import { FormHelperConfig, Selector } from './form-helper-config';
import { SubmitHandlerLoader } from './submit-handler/submit-handler-loader';
import { SubmitHandler } from './submit-handler/submit-handler';
import { doAfter, } from './form-helper-utils';
import { isObject, isString } from 'util';
import { ErrorHandlerTooltip } from './error-handler/error-handler-tooltip';
import { ElementBindToControlDirective } from './elem-bind-to-control.directive';
import { ErrorHandler } from './error-handler/error-handler';
const $ = require('jquery');

/**
 * angular表单存在的bug：
 *  1)bug：表单域name使用模板表达式生成(如：name="name-{{attr}}")，则最终的html标签中name属性会丢失
 *    fix：同时使用name和[attr.name]
 *  2)bug：当使用ngFor迭代表单域，且name使用数组下标(如：name-{{i}})，此时若动态新增/删除表单域，会造成表单域数量混乱
 *    fix：这种情况下请保证name唯一，且必须使用trackBy返回唯一标识，推荐使用uuid等工具(如：name-{{uuid}})
 */
@Directive({
    selector: '[formHelper]',
    exportAs: 'formHelper'
})
export class FormHelperDirective implements AfterViewInit, OnDestroy {

    @Input()
    set config(config: FormHelperConfig) {
        $.extend(true, this._config, config);
        if (isString(this._config.submitHandler)) {
            this._config.submitHandler = <any>{ name: this._config.submitHandler };
        }
        if (isString(this._config.errorHandler)) {
            this._config.errorHandler = <any>{ name: this._config.errorHandler };
        }
    }

    @HostListener('keydown', [ '$event' ])
    keydown(event: KeyboardEvent) {
        if ((event.keyCode || event.which) == 13 && event.srcElement.nodeName.toUpperCase() != 'TEXTAREA') {
            event.preventDefault();
        }
    }

    @HostListener('window:resize')
    resize() {
        //this.fieldCache.forEach($field => {
        //    let handler = $field.data(this.errorHandlerKey);
        //    handler && handler.reposition();
        //});
    }

    submitted: boolean;

    private mutationObserver: MutationObserver;
    private $form: JQuery;
    private _config: FormHelperConfig;
    private destroys: (Subscription | Function)[] = [];
    private noop = new Function();

    private fieldCache: Map<string, JQuery> = new Map();
    private firstErrorName: string;
    private minOffset: number;

    private static submitHandlerMap = new Map();
    private static errorHandlerMap = new Map();

    // ------------------- 分割线 ------------------------------

    constructor(private ngForm: NgForm,
                private form: ElementRef) {
        this._config = {
            resetAfterSubmitted: true,
            scrollTarget: window,
            autoScrollToTopError: true,
            scrollTargetSelector: '.fh-scroll-target',
            className: 'fh-theme-default',
            errorClassName: 'fh-error',
            errorHandler: { name: 'tooltip' },
            submitHandler: { name: 'loader' }
        };

        this.$form = $(form.nativeElement);

        this.mutationObserver = new MutationObserver(() => {
            this.bindSubmitButtons();
            this.fieldCache.clear();
            this.bindErrorHandlers();
        });
        this.mutationObserver.observe(this.form.nativeElement, {
            childList: true,
            subtree: true
        });
    }

    ngAfterViewInit() {
        if (this._config.className) {
            this.$form.addClass(this._config.className);
        }
    }

    ngOnDestroy() {
        this.fieldCache.clear();
        this.mutationObserver.disconnect();
        this.destroys.forEach(destroy => {
            if (destroy instanceof Subscription) {
                destroy.unsubscribe();
            } else {
                destroy();
            }
        });
    }

    static registerSubmitHandler(name: string, handler: Function) {
        this.submitHandlerMap.set(name, handler);
    }

    static registerErrorHandler(name: string, handler: Function) {
        this.errorHandlerMap.set(name, handler);
    }

    private bindSubmitButtons() {
        let handlerName = this._config.submitHandler ? (<any>this._config.submitHandler).name : undefined;

        this.$form.find(':submit').each((i, btn) => {
            let $btn = $(btn),
                handlerKey = 'formHelper.submitHandler',
                clickEvent = 'click.formHelper',
                bindData = $btn.data(handlerKey);

            if (bindData && bindData.name == handlerName) {
                return;
            } else if (bindData && bindData.name != handlerName) {
                $btn.off(clickEvent);
            }

            if (handlerName) {
                let HandlerClass = FormHelperDirective.submitHandlerMap.get(handlerName);
                if (HandlerClass instanceof Function) {
                    let handlerInstance = new HandlerClass($btn, (<any>this._config.submitHandler).config);
                    $btn.data(handlerKey, { name: handlerName, data: handlerInstance });
                    $btn.on(clickEvent, () => this.submit(handlerInstance));
                    this.destroys.push(() => $btn.off(clickEvent));
                    if (handlerInstance.destroy) {
                        this.destroys.push(() => handlerInstance.destroy());
                    }
                    return;
                }
            }

            // submitHandler=false或指定的submitHandler找不到
            $btn.data(handlerKey, {});
            $btn.on(clickEvent, () => this.submit());
            this.destroys.push(() => $btn.off(clickEvent));
        });
    }

    private bindErrorHandlers(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        let handlerName = this._config.errorHandler ? (<any>this._config.errorHandler).name : undefined,
            handlerKey = 'formHelper.errorHandler';

        for (let name in controls) {
            let control = controls[ name ];
            if (control instanceof FormGroup) {
                this.bindErrorHandlers(control.controls);
                return;
            }

            let $field = $(control[ ElementBindToControlDirective.key ]);
            if ($field.length == 0) {
                continue;
            }

            this.fieldCache.set(name, $field);

            let bindData = $field.data(handlerKey);
            if (bindData && bindData.name == handlerName) {
                return;
            } else if (bindData && bindData.name != handlerName) {
                (<ErrorHandler>bindData.data).whenValid();
            }

            if (handlerName) {
                let HandlerClass = FormHelperDirective.errorHandlerMap.get(handlerName);
                if (HandlerClass instanceof Function) {
                    let handlerInstance = new HandlerClass($field, (<any>this._config.errorHandler).config);
                    $field.data(handlerKey, { name: handlerName, data: handlerInstance });
                    if (handlerInstance.destroy) {
                        this.destroys.push(() => handlerInstance.destroy());
                    }
                }
                continue;
            }

            // errorHandler=false或指定的errorHandler找不到
            $field.data(handlerKey, {});

            //// 是否是远程验证
            //let debounceTime = parseInt($field.attr('fh-remote') || '0');
            //
            //// 动态表单每次删除时，valueChanges和statusChanges等字段都会重刷
            //if (control.statusChanges) {
            //    control.statusChanges.debounceTime(debounceTime).subscribe(() => {
            //        if (control.enabled) {
            //            let $field = this.fieldCache.get(name),
            //                handler = $field && $field.data(this.errorHandlerKey),
            //                $fhScrollParent;
            //
            //            if ($field && $field.is(':hidden')) {
            //                $fhScrollParent = $field.closest('.' + this.fhScrollParentKey);
            //            }
            //
            //            if (control.valid || control.pristine) {
            //                handler && handler.whenValid();
            //                $field && $field.removeClass('error');
            //                $fhScrollParent && $fhScrollParent.removeClass('error');
            //            } else {
            //                handler && handler.whenInvalid();
            //                $field && $field.addClass('error');
            //                $fhScrollParent && $fhScrollParent.addClass('error');
            //            }
            //        }
            //    });
            //}
        }
    }

    private submit(submitHandler?: SubmitHandler) {
        this.submitted = true;

        if (this.ngForm.valid) {
            if (submitHandler) {
                submitHandler.start();
            }

            let endFn = submitHandler ? submitHandler.end.bind(submitHandler) : this.noop;
            if (this._config.onSuccess instanceof Function) {
                doAfter(this._config.onSuccess, () => {
                    doAfter(endFn, () => {
                        if (this._config.onComplete instanceof Function) {
                            this._config.onComplete();
                        }
                        this.reset();
                    });
                });
            }
        } else {
            //this.firstErrorName = null;
            //this.minOffset = Number.MAX_SAFE_INTEGER;
            //
            //for (let k in this.ngForm.controls) {
            //    this.validateControl(k, this.ngForm.controls[ k ]);
            //}
            //
            //// 滚动到第一个错误域
            //if (this.firstErrorName) {
            //    let fieldActualTop,
            //        selfOffset = this.fieldCache.get(this.firstErrorName).attr('offset');
            //
            //    if (this._config.scrollTarget === window) {
            //        fieldActualTop = this.minOffset;
            //    } else {
            //        // 修正使用semantic弹层，表单top由自身top叠加滚动窗体top
            //        fieldActualTop = this.minOffset + $(this._config.scrollTarget).scrollTop();
            //    }
            //
            //    smoothScroll2YPosition(this._config.scrollTarget, fieldActualTop
            //        - (selfOffset == undefined ? this._config.offset : parseInt(selfOffset)));
            //}
        }
    }

    private reset() {
        if (this._config.resetAfterSubmitted) {
            this.ngForm.reset();
        }
    }

    //private validateControl(name: string, ctl: AbstractControl) {
    //    if (ctl instanceof FormGroup) {
    //        for (let name in ctl.controls) {
    //            this.validateControl(name, ctl.controls[ name ]);
    //        }
    //        return;
    //    }
    //
    //    let $field = this.fieldCache.get(name);
    //
    //    // 设置control为dirty状态，使错误信息显示
    //    ctl.markAsDirty();
    //    if (ctl.invalid) {
    //        if ($field) {
    //            let handler = $field.data(this.errorHandlerKey);
    //            handler && handler.whenInvalid();
    //            $field.addClass('error');
    //
    //            if ($field.is(':hidden')) {
    //                let $fhScrollParent = $field.closest('.' + this.fhScrollParentKey);
    //                if ($fhScrollParent.length) {
    //                    $fhScrollParent.addClass('error');
    //                }
    //            }
    //        }
    //    }
    //
    //    // 根据offset找到第一个错误域
    //    if (this._config.scrollable && ctl.invalid && $field) {
    //        let $closestVisibleField = this.findClosestVisibleField($field),
    //            top = $closestVisibleField.offset().top;
    //
    //        if (!this.firstErrorName || top < this.minOffset) {
    //            this.firstErrorName = name;
    //            this.minOffset = top;
    //        }
    //    }
    //}
    //
    //private findClosestVisibleField($field: JQuery) {
    //    let $parent = $field,
    //        $prev: JQuery,
    //        $next: JQuery,
    //        prevHasScrollKey: boolean,
    //        nextHasScrollKey: boolean;
    //
    //    if ($parent.is(':hidden')) {
    //        do {
    //            $prev = $parent.prev();
    //            $next = $parent.next();
    //            prevHasScrollKey = $prev.hasClass(this.fhScrollParentKey);
    //            nextHasScrollKey = $next.hasClass(this.fhScrollParentKey);
    //            $parent = $parent.parent();
    //        } while ($parent.length > 0
    //        && $parent.is(':hidden')
    //        && !$parent.hasClass(this.fhScrollParentKey)
    //        && !prevHasScrollKey
    //        && !nextHasScrollKey
    //        && !$parent.is('form'));
    //    }
    //
    //    return prevHasScrollKey ? $prev : nextHasScrollKey ? $next : $parent;
    //}
}

FormHelperDirective.registerSubmitHandler('loader', SubmitHandlerLoader);
FormHelperDirective.registerErrorHandler('tooltip', ErrorHandlerTooltip);