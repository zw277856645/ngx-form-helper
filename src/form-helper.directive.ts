import { Input, ElementRef, Directive, OnDestroy, HostListener, AfterViewInit, NgZone } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import { FormHelperConfig } from './form-helper-config';
import { SubmitHandlerLoader } from './submit-handler/submit-handler-loader';
import { SubmitHandler } from './submit-handler/submit-handler';
import { doAfter, ELEMENT_BIND_TO_CONTROL_KEY, findProxyItem, getScrollProxy, noop } from './form-helper-utils';
import { isNumber, isString } from 'util';
import { ErrorHandlerTooltip } from './error-handler/error-handler-tooltip';
import { ErrorHandlerText } from './error-handler/error-handler-text';
const $ = require('jquery');
const TWEEN = require('@tweenjs/tween.js');

/**
 * --------------------------------------------------------------------------------------------------------
 * data-* api
 *  1)debounce-time：远程验证时使用，指定请求抖动时间。单位ms，使用方表单域/表单组
 *  2)scroll-proxy：设置表单域/表单组滚动代理
 *                  语法：^ -> 父节点，~ -> 前一个兄弟节点，+ -> 后一个兄弟节点。可以任意组合
 *                  示例：^^^，^2，~3^4+2
 *
 * --------------------------------------------------------------------------------------------------------
 * validators
 *  1)trimmedRequired
 *
 * --------------------------------------------------------------------------------------------------------
 * angular表单存在的bug
 *  1)bug：表单域name使用模板表达式生成(如：name="name-{{attr}}")，则最终的html标签中name属性会丢失
 *    fix：同时使用name和[attr.name]。使用本插件不需要[attr.name]
 *  2)bug：当使用ngFor迭代表单域，且name使用数组下标(如：name-{{i}})，此时若动态新增/删除表单域，会造成表单域数量混乱
 *    fix：这种情况下请保证name唯一，且必须使用trackBy返回唯一标识，推荐使用uuid等工具(如：name-{{uuid}})
 */
@Directive({
    selector: '[formHelper]',
    exportAs: 'formHelper'
})
export class FormHelperDirective implements AfterViewInit, OnDestroy {

    @Input()
    set formHelper(config: FormHelperConfig) {
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
        this.reposition();
    }

    submitted: boolean;

    private _config: FormHelperConfig;
    private mutationObserver: MutationObserver;
    private $form: JQuery;
    private destroys: (Subscription | Function)[] = [];

    private readonly submitHandlerKey = 'formHelper.submitHandler';
    private readonly errorHandlerKey = 'formHelper.errorHandler';

    private static submitHandlerMap = new Map();
    private static errorHandlerMap = new Map();

    // ------------------- 分割线 ------------------------------

    constructor(private ngForm: NgForm,
                private form: ElementRef,
                private zone: NgZone) {
        this._config = {
            autoReset: true,
            context: window,
            offsetTop: 0,
            autoScroll: true,
            className: 'fh-theme-default',
            errorClassName: 'fh-error',
            errorGroupClassName: 'fh-group-error',
            errorHandler: { name: 'tooltip' },
            submitHandler: { name: 'loader' },
            onSuccess: noop,
            onDeny: noop,
            onComplete: noop
        };

        this.$form = $(form.nativeElement);

        this.mutationObserver = new MutationObserver(() => {
            this.bindSubmitButtons();
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
        this.mutationObserver.disconnect();
        this.destroys.forEach(destroy => {
            if (destroy instanceof Subscription) {
                destroy.unsubscribe();
            } else {
                destroy();
            }
        });
    }

    // --------------------------- ngForm status shortcut ------------------

    get form() {
        return this.ngForm;
    }

    get valid() {
        return this.ngForm.valid;
    }

    get invalid() {
        return this.ngForm.invalid;
    }

    get pending() {
        return this.ngForm.pending;
    }

    get dirty() {
        return this.ngForm.dirty;
    }

    get pristine() {
        return this.ngForm.pristine;
    }

    get disabled() {
        return this.ngForm.disabled;
    }

    get enabled() {
        return this.ngForm.enabled;
    }

    get touched() {
        return this.ngForm.touched;
    }

    get untouched() {
        return this.ngForm.untouched;
    }

    // ------------------------- registers -------------------------------

    static registerSubmitHandler(name: string, handler: Function) {
        this.submitHandlerMap.set(name, handler);
    }

    static registerErrorHandler(name: string, handler: Function) {
        this.errorHandlerMap.set(name, handler);
    }

    // ------------------------- publics -------------------------------

    reposition(ele?: string) {
        if (isString(ele)) {
            for (let name in this.ngForm.controls) {
                if (name == ele) {
                    this.triggerReposition(this.ngForm.controls[ name ]);
                    break;
                }
            }
        } else {
            for (let name in this.ngForm.controls) {
                this.triggerReposition(this.ngForm.controls[ name ]);
            }
        }
    }

    // track=true，跟踪所有control状态直到全部为pristine
    // 原因：重置后触发一些不可控操作导致表单再次赋值，触发状态监听(listenStatusChanges)
    reset(track?: boolean | number) {
        this.resetControls();
        if (track) {
            setTimeout(() => {
                for (let name in this.ngForm.controls) {
                    if (this.ngForm.controls[ name ].dirty) {
                        this.reset(track);
                        break;
                    }
                }
            }, isNumber(track) ? track : 0);
        }
    }

    // ------------------------- privates --------------------------------

    private triggerReposition(control: AbstractControl) {
        let $field = $(control[ ELEMENT_BIND_TO_CONTROL_KEY ]);
        if ($field.length) {
            let bindData = $field.data(this.errorHandlerKey),
                errorHandler = bindData && bindData.data;
            if (errorHandler && errorHandler.reposition) {
                errorHandler.reposition();
            }
        }
        if (control instanceof FormGroup) {
            for (let name in control.controls) {
                this.triggerReposition(control.controls[ name ]);
            }
        }
    }

    private bindSubmitButtons() {
        let handlerName = this._config.submitHandler ? (<any>this._config.submitHandler).name : undefined;

        this.$form
            .find(':submit')
            .add($(this._config.extraSubmits))
            .each((i, btn) => {
                let $btn = $(btn),
                    clickEvent = 'click.formHelper',
                    bindData = $btn.data(this.submitHandlerKey);

                if (bindData && bindData.name == handlerName) {
                    return;
                } else if (bindData && bindData.name != handlerName) {
                    $btn.off(clickEvent);
                }

                if (handlerName) {
                    let HandlerClass = FormHelperDirective.submitHandlerMap.get(handlerName);
                    if (HandlerClass instanceof Function) {
                        let handlerInstance = new HandlerClass($btn, (<any>this._config.submitHandler).config);
                        if (handlerInstance.destroy) {
                            this.destroys.push(() => handlerInstance.destroy());
                        }

                        $btn.on(clickEvent, () => this.submit(handlerInstance));
                        this.destroys.push(() => $btn.off(clickEvent));

                        $btn.data(this.submitHandlerKey, { name: handlerName, data: handlerInstance });
                        return;
                    }
                }

                // submitHandler=false或指定的submitHandler找不到
                $btn.on(clickEvent, () => this.submit());
                this.destroys.push(() => $btn.off(clickEvent));
                $btn.data(this.submitHandlerKey, {});
            });
    }

    private bindErrorHandlers(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        for (let name in controls) {
            let control = controls[ name ];
            if (control instanceof FormGroup) {
                this.bindErrorHandlers(control.controls);
            }
            Observable
                .timer(0, 100)
                .skipWhile(() => !control[ ELEMENT_BIND_TO_CONTROL_KEY ])
                .first()
                .subscribe(() => this.bindErrorHandler(control));
        }
    }

    private bindErrorHandler(control: AbstractControl) {
        let handlerName = this._config.errorHandler ? (<any>this._config.errorHandler).name : undefined;
        let $field = $(control[ ELEMENT_BIND_TO_CONTROL_KEY ]);

        if ($field.length == 0) {
            return;
        }

        let bindData = $field.data(this.errorHandlerKey);
        if (bindData && bindData.name == handlerName) {
            return;
        } else if (bindData && bindData.name != handlerName) {
            if (bindData.data) {
                bindData.data.whenValid();
            }
            if (bindData.subscription) {
                bindData.subscription.unsubscribe();
            }
        }

        if (handlerName) {
            let HandlerClass = FormHelperDirective.errorHandlerMap.get(handlerName);
            if (HandlerClass instanceof Function) {
                let handlerInstance = new HandlerClass($field, (<any>this._config.errorHandler).config, control);
                if (handlerInstance.destroy) {
                    this.destroys.push(() => handlerInstance.destroy());
                }

                let subscription = this.listenStatusChanges(control, $field);
                this.destroys.push(subscription);

                $field.data(this.errorHandlerKey, { name: handlerName, data: handlerInstance, subscription });
                return;
            }
        }

        // errorHandler=false或指定的errorHandler找不到
        let subscription = this.listenStatusChanges(control, $field);
        this.destroys.push(subscription);
        $field.data(this.errorHandlerKey, { subscription });
    }

    private listenStatusChanges(control: AbstractControl, $field: JQuery) {
        return control.statusChanges.subscribe(() => {
            if (control.enabled && control.dirty && !control.pending) {
                if (control.valid) {
                    this.whenValid(control, $field);
                } else if (control.invalid) {
                    this.whenInvalid(control, $field);
                }
            }
        });
    }

    private whenValid(control: AbstractControl, $field?: JQuery) {
        if (!$field) {
            $field = $(control[ ELEMENT_BIND_TO_CONTROL_KEY ]);
        }
        if ($field.length == 0) {
            return;
        }

        if (control instanceof FormControl && this._config.errorClassName) {
            $field.removeClass(this._config.errorClassName);
        } else if (control instanceof FormGroup && this._config.errorGroupClassName) {
            $field.removeClass(this._config.errorGroupClassName);
        }

        let bindData = $field.data(this.errorHandlerKey),
            errorHandler = bindData && bindData.data;
        if (errorHandler) {
            errorHandler.whenValid();
        }
    }

    private whenInvalid(control: AbstractControl, $field?: JQuery) {
        if (!$field) {
            $field = $(control[ ELEMENT_BIND_TO_CONTROL_KEY ]);
        }
        if ($field.length == 0) {
            return;
        }

        if (control instanceof FormControl && this._config.errorClassName) {
            $field.addClass(this._config.errorClassName);
        } else if (control instanceof FormGroup && this._config.errorGroupClassName) {
            $field.addClass(this._config.errorGroupClassName);
        }

        let bindData = $field.data(this.errorHandlerKey),
            errorHandler = bindData && bindData.data;
        if (errorHandler) {
            errorHandler.whenInvalid();
        }
    }

    private submit(submitHandler?: SubmitHandler) {
        this.submitted = true;

        if (this.ngForm.valid) {
            if (submitHandler) {
                submitHandler.start();
            }

            let endFn = submitHandler ? submitHandler.end.bind(submitHandler) : noop;
            if (this._config.onSuccess instanceof Function) {
                doAfter(this._config.onSuccess, (res) => {
                    doAfter(endFn, () => {
                        if (this._config.onComplete instanceof Function) {
                            this._config.onComplete(res);
                        }
                        if (this._config.autoReset) {
                            this.reset();
                        }
                    });
                });
            }
        } else {
            this.validateControls();

            if (this._config.onDeny instanceof Function) {
                this._config.onDeny();
            }

            if (this._config.autoScroll) {
                let pendings = this.getPendingControls();
                if (pendings.length) {
                    Observable.forkJoin(pendings).subscribe(() => this.scrollToTopError());
                } else {
                    this.scrollToTopError();
                }
            }
        }
    }

    private validateControls(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        for (let name in controls) {
            let control = controls[ name ];
            if (control instanceof FormGroup) {
                this.validateControls(control.controls);
                continue;
            }

            // 设置control为dirty状态，使错误信息显示
            control.markAsDirty();

            // 触发control.statusChanges。默认会自动触发FormGroup的状态检测
            control.updateValueAndValidity();
        }
    }

    private getPendingControls(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        let pendings: Observable<any>[] = [];
        for (let name in controls) {
            let control = controls[ name ];
            if (control instanceof FormGroup) {
                let pds: Observable<any>[] = this.getPendingControls(control.controls);
                if (pds.length) {
                    pendings.push(...pds);
                }
                continue;
            }
            if (control.enabled && control.pending) {
                pendings.push(Observable.interval(100).skipWhile(() => control.pending).first());
            }
        }
        return pendings;
    }

    private scrollToTopError() {
        let $context = this.findContext();
        if (!$context || $context.length == 0) {
            return;
        }

        let minOffsetTop = this.calcMinOffsetTop();
        if (minOffsetTop == Number.MAX_SAFE_INTEGER) {
            minOffsetTop = this.$form.offset().top;
        }
        minOffsetTop -= this._config.offsetTop;

        // 非context:window滚动窗体中表单域/表单组实际offset.top需要减去滚动体offset.top，加上滚动体当前scrollTop
        if ($context[ 0 ] != window && $context[ 0 ].nodeName.toUpperCase() != 'HTML') {
            minOffsetTop -= $context.offset().top;
            minOffsetTop += $context.scrollTop();
        }

        let animationRequest;
        let currentTween = new TWEEN.Tween({ y: $context.scrollTop() })
            .to({ y: minOffsetTop }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(data => {
                if (!isNaN(data.y)) {
                    $context.scrollTop(data.y);
                }
            })
            .onComplete(() => cancelAnimationFrame(animationRequest))
            .start();

        const animate = (time?) => {
            currentTween.update(time);
            if (currentTween._object.y != minOffsetTop) {
                this.zone.runOutsideAngular(() => animationRequest = requestAnimationFrame(animate));
            }
        };
        animate();
    }

    private findContext() {
        let context = this._config.context,
            dotsPathReg = /^(\.\/?|\.\.(\/\.\.)*\/?)$/;
        if (isString(context) && dotsPathReg.test(<string>context)) {
            if (/^\.\/?$/.test(<string>context)) {
                return this.$form;
            } else {
                let num = (<string>context).split('/').filter(v => v).length,
                    $field = this.$form,
                    n = 0;
                while (n++ < num) {
                    $field = $field.parent();
                    if ($field.length == 0) {
                        return null;
                    }
                }
                return $field;
            }
        } else {
            return $(context);
        }
    }

    private calcMinOffsetTop(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        let minOffsetTop = Number.MAX_SAFE_INTEGER;
        for (let name in controls) {
            let control = controls[ name ];
            if (control.enabled && control.invalid) {
                // 跳过ngModelGroup，由其子控件计算合适的元素
                if (control instanceof FormGroup) {
                    let offsetTop = this.calcMinOffsetTop(control.controls);
                    if (offsetTop != Number.MAX_SAFE_INTEGER) {
                        minOffsetTop = Math.min(offsetTop, minOffsetTop);
                        continue;
                    }

                    // offset == Number.MAX_SAFE_INTEGER
                    // 此场景为ngModelGroup -> invalid，ngModelGroup.controls -> valid
                    // 原因：ngModelGroup约束条件失败，但没有子组件或所有子控件不具备约束条件
                    // 结果：其所有子组件状态都是valid
                    // fix：这种场景下ngModelGroup不跳过，加入下面的计算
                }

                let $item = this.findClosestVisibleItem(control);
                if ($item) {
                    minOffsetTop = Math.min($item.offset().top, minOffsetTop);
                }
            }
        }
        return minOffsetTop;
    }

    private findClosestVisibleItem(control: AbstractControl) {
        let $field = $(control[ ELEMENT_BIND_TO_CONTROL_KEY ]);

        // 滚动代理
        let $proxy = findProxyItem($field, getScrollProxy($field));
        if ($proxy && $proxy.is(':visible')) {
            return $proxy;
        }

        // 表单域/表单组本身
        if ($field.is(':visible')) {
            return $field;
        }

        // 最近可见ngModelGroup
        if (control.parent && control.parent != this.ngForm.control) {
            return this.findClosestVisibleItem(control.parent);
        }

        // 没有找到符合元素，此表单域会被滚动定位忽略
        return null;
    }

    private resetControls(controls: { [key: string]: AbstractControl; } = this.ngForm.controls) {
        // 提前设置pristine，防止后面的ngForm.reset子控件FormControl.reset级联影响
        // FormGroup状态检测执行(listenStatusChanges)，导致错误提示不正常显示(闪烁)
        for (let name in controls) {
            controls[ name ].markAsPristine();
        }

        // form重置，只在最外层执行
        if (controls == this.ngForm.controls) {
            this.ngForm.reset();
        }

        // 递归关闭错误提示
        if (this._config.errorHandler) {
            let control;
            for (let name in controls) {
                control = controls[ name ];
                this.whenValid(control);
                if (control instanceof FormGroup) {
                    this.resetControls(control.controls);
                }
            }
        }
    }

}

FormHelperDirective.registerSubmitHandler('loader', SubmitHandlerLoader);
FormHelperDirective.registerErrorHandler('tooltip', ErrorHandlerTooltip);
FormHelperDirective.registerErrorHandler('text', ErrorHandlerText);