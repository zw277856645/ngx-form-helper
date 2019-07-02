import {
    Input, ElementRef, Directive, OnDestroy, HostListener, AfterViewInit, NgZone, Inject, Renderer2, Output, Optional,
    QueryList, InjectionToken, EventEmitter, ContentChildren, SkipSelf, Provider
} from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { EMPTY, forkJoin, interval, Observable, of, Subscription } from 'rxjs';
import { FormHelperConfig } from './form-helper-config';
import { arrayProviderFactory, async2Observable, getProxyElement, noop, splitClassNames } from './utils';
import { catchError, finalize, first, map, skipWhile, switchMap } from 'rxjs/operators';
import { ErrorHandler } from './error-handler/error-handler';
import { SubmitHandler } from './submit-handler/submit-handler';
import { getOffset, getScrollTop, isVisible, setScrollTop } from 'cmjs-lib';

const TWEEN = require('@tweenjs/tween.js');

export type SubmitWrapper = (request?: any) => Observable<any>;

export const FORM_HELPER_CONFIG = new InjectionToken<FormHelperConfig>('form_helper_config');

export const FORM_HELPER_CONFIG_ARRAY = new InjectionToken<FormHelperConfig[]>('form_helper_config_array');

export function formHelperConfigProvider(config: FormHelperConfig): Provider[] {
    return [
        {
            provide: FORM_HELPER_CONFIG,
            useValue: config
        },
        {
            provide: FORM_HELPER_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [ FORM_HELPER_CONFIG, [ new SkipSelf(), new Optional(), FORM_HELPER_CONFIG_ARRAY ] ]
        }
    ];
}

/**
 * validators
 *  1)trimmedRequired
 *  2)listRequired
 *  3)checkboxRequired
 *
 * angular表单存在的bug
 *  1)bug：当使用ngFor迭代表单域，且name使用数组下标(如：name-{{i}})，此时若动态新增/删除表单域，会造成表单域数量混乱
 *    fix：这种情况下请保证name唯一，且必须使用trackBy返回唯一标识，推荐使用uuid等工具(如：name-{{uuid}})
 *
 * 设计不好的地方
 *  1)validPass事件中需要向用户传递 SubmitWrapper
 *    原因：已rxjs为例，请求通常写法为 request.subscribe(() => response())，需要在request与response之间插入一些操作，
 *         借助 submitWrapper(request).subscribe(() => response()) 实现功能，但需要用户调用，对用户不透明
 *
 *  2)加载message不友好，格式为validator[.order][.async]
 *    原因：指定order是因为页面被浏览器解析后属性顺序是不确定的，跟源代码书写顺序无关
 */
@Directive({
    selector: '[formHelper]',
    exportAs: 'formHelper'
})
export class FormHelperDirective implements OnDestroy, AfterViewInit {

    @ContentChildren(ErrorHandler, { descendants: true }) errorHandlers: QueryList<ErrorHandler>;

    @ContentChildren('reset') set resets(resets: QueryList<ElementRef>) {
        resets.filter(reset => this.resetEles.indexOf(reset.nativeElement) < 0)
              .forEach(reset => {
                  this.resetEles.push(reset.nativeElement);
                  this.subscription.add(this.renderer.listen(reset.nativeElement, 'click', () => this.reset()));
              });
    }

    @ContentChildren('submit') set submits(submits: QueryList<ElementRef>) {
        submits.filter(submit => this.submitEles.indexOf(submit.nativeElement) < 0)
               .forEach(submit => {
                   this.submitEles.push(submit.nativeElement);
                   this.subscription.add(this.renderer.listen(submit.nativeElement, 'click', () => this.submit()));
               });
    }

    @Input() autoReset: boolean = true;

    @Input() context: Window | HTMLElement | string = window;

    @Input() scrollProxy: string;

    @Input() autoScroll: boolean = true;

    @Input() offsetTop: number = 0;

    @Input() validateImmediate: boolean;

    @Input() classNames: string | false = 'fh-theme';

    @Input() errorClassNames: string | false = 'fh-error';

    @Input() errorGroupClassNames: string | false = 'fh-group-error';

    @Input() resultOkAssertion: (res: any) => boolean;

    // 验证通过
    @Output() validPass = new EventEmitter();

    // 验证不通过
    @Output() validFail = new EventEmitter();

    @HostListener('keydown', [ '$event' ]) onKeydown(event: KeyboardEvent) {
        if ((event.keyCode || event.which) === 13 && event.srcElement.nodeName.toUpperCase() !== 'TEXTAREA') {
            event.preventDefault();
        }
    }

    @HostListener('window:resize') onResize() {
        this.errorHandlers.forEach(eh => {
            if (eh.messageHandler && eh.messageHandler.reposition) {
                eh.messageHandler.reposition();
            }
        });
    }

    form: HTMLFormElement;
    submitted: boolean;

    private subscription = new Subscription();
    private resetEles: Element[] = [];
    private submitEles: Element[] = [];

    constructor(public ngForm: NgForm,
                private eleRef: ElementRef,
                private zone: NgZone,
                private renderer: Renderer2,
                @Optional() @Inject(FORM_HELPER_CONFIG_ARRAY) private overrideConfigs: FormHelperConfig[]) {
        Object.assign(this, ...(overrideConfigs || []));
        this.form = eleRef.nativeElement;
    }

    ngAfterViewInit() {
        this.renderer.setAttribute(this.form, 'novalidate', 'novalidate');
        splitClassNames(this.classNames).forEach(cls => this.renderer.addClass(this.form, cls));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    submit(submitHandler?: SubmitHandler) {
        this.submitted = true;

        if (this.ngForm.valid) {
            if (submitHandler) {
                submitHandler.start();
            }

            this.validPass.emit(((request?: any) => {
                let requestError = false;
                let assertSuc = true;

                return async2Observable(request).pipe(
                    catchError(() => of(requestError = true)),
                    switchMap(res => async2Observable(submitHandler ? submitHandler.end() : noop()).pipe(
                        map(() => {
                            if (requestError) {
                                throw new Error('request fail');
                            }
                            if (typeof this.resultOkAssertion === 'function') {
                                assertSuc = this.resultOkAssertion(res);

                                if (!assertSuc) {
                                    throw new Error('request assertion fail');
                                }
                            }

                            return res;
                        })
                    )),
                    catchError(() => {
                        assertSuc = false;

                        return EMPTY;
                    }),
                    finalize(() => {
                        if (assertSuc) {
                            if (this.autoReset) {
                                this.reset();
                            }
                        }
                    })
                );
            }) as SubmitWrapper);
        } else {
            this.validateControls();

            this.validFail.emit();

            if (this.autoScroll) {
                let pendings = this.getPendingControls();

                if (pendings.length) {
                    forkJoin(pendings).subscribe(() => this.scrollToTopError());
                } else {
                    this.scrollToTopError();
                }
            }
        }
    }

    reset() {
        this.submitted = false;
        this.resetControls();
    }

    private static validateControl(control: AbstractControl) {
        // 设置control为dirty状态，使错误信息显示
        control.markAsDirty();

        // 触发control.statusChanges。默认会自动触发FormGroup的状态检测
        control.updateValueAndValidity();
    }

    private validateControls(controls: { [ key: string ]: AbstractControl; } = this.ngForm.controls) {
        let control: AbstractControl;

        for (let name in controls) {
            control = controls[ name ];
            FormHelperDirective.validateControl(control);

            if (control instanceof FormGroup) {
                this.validateControls(control.controls);
            }
        }
    }

    private getPendingControls(controls: { [ key: string ]: AbstractControl; } = this.ngForm.controls) {
        let pendings: Observable<any>[] = [];

        for (let name in controls) {
            let control = controls[ name ];

            if (control.enabled && control.pending) {
                pendings.push(interval(100).pipe(skipWhile(() => control.pending), first()));
            }
            if (control instanceof FormGroup) {
                pendings.push(...this.getPendingControls(control.controls));
            }
        }

        return pendings;
    }

    private scrollToTopError() {
        let context = this.findContext();

        if (!context) {
            return;
        }

        let minOffsetTop = this.calcMinOffsetTop();

        if (minOffsetTop === Number.MAX_SAFE_INTEGER) {
            minOffsetTop = getOffset(this.form).top;
        }

        minOffsetTop -= +this.offsetTop;

        // 非window滚动窗体中表单域/表单组实际offsetTop需要减去滚动体offsetTop，加上滚动体当前scrollTop
        if (context !== window && context instanceof HTMLElement && context.nodeName.toUpperCase() !== 'HTML') {
            minOffsetTop -= getOffset(context).top;
            minOffsetTop += context.scrollTop;
        }

        let animationRequest: number;
        let currentTween = new TWEEN.Tween({ y: getScrollTop(context) })
            .to({ y: minOffsetTop }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((data: any) => {
                if (!isNaN(data.y)) {
                    setScrollTop(context, data.y);
                }
            })
            .onComplete(() => cancelAnimationFrame(animationRequest))
            .start();

        const animate = (time?: any) => {
            currentTween.update(time);
            if (currentTween._object.y !== minOffsetTop) {
                this.zone.runOutsideAngular(() => animationRequest = requestAnimationFrame(animate));
            }
        };

        animate();
    }

    private findContext() {
        if (typeof this.context === 'string') {
            // 处理点号表达式
            if (/^(\.\/?|\.\.(\/\.\.)*\/?)$/.test(this.context)) {
                if (/^\.\/?$/.test(this.context)) {
                    return this.form;
                } else {
                    let num = this.context.split('/').filter(v => v).length,
                        field: Element = this.form,
                        n = 0;

                    while (n++ < num) {
                        field = field.parentElement;

                        if (!field) {
                            return window;
                        }
                    }

                    return field;
                }
            } else {
                return document.querySelector(this.context) || window;
            }
        } else {
            return this.context || window;
        }
    }

    private calcMinOffsetTop(controls: { [ key: string ]: AbstractControl; } = this.ngForm.controls) {
        let minOffsetTop = Number.MAX_SAFE_INTEGER;
        let control: AbstractControl;
        let offsetTop: number;
        let closestVisibleElement: HTMLElement;

        for (let name in controls) {
            control = controls[ name ];

            if (control.enabled && control.invalid) {
                // 跳过ngModelGroup，由其子控件计算合适的元素
                if (control instanceof FormGroup) {
                    offsetTop = this.calcMinOffsetTop(control.controls);

                    if (offsetTop !== Number.MAX_SAFE_INTEGER) {
                        minOffsetTop = Math.min(offsetTop, minOffsetTop);
                        continue;
                    }

                    // offset == Number.MAX_SAFE_INTEGER
                    // 此场景为ngModelGroup -> invalid，ngModelGroup.controls -> valid
                    // 原因：ngModelGroup约束条件失败，但没有子组件或所有子控件不具备约束条件
                    // 结果：其所有子组件状态都是valid
                    // fix：这种场景下ngModelGroup不跳过，加入下面的计算
                }

                closestVisibleElement = this.findClosestVisibleItem(control) as HTMLElement;
                if (closestVisibleElement) {
                    minOffsetTop = Math.min(getOffset(closestVisibleElement).top, minOffsetTop);
                }
            }
        }

        return minOffsetTop;
    }

    private findClosestVisibleItem(control: AbstractControl): Element | null {
        let errorHandler = this.errorHandlers.find(eh => eh.control === control);

        // 没有使用ErrorHandler指令标记的控件，将失去插件相关功能
        if (!errorHandler) {
            return null;
        }

        // 优先使用滚动代理
        let proxyEle = getProxyElement(errorHandler.element, errorHandler.scrollProxy);
        if (proxyEle && isVisible(proxyEle)) {
            return proxyEle;
        }

        // 表单域/表单组本身
        if (isVisible(errorHandler.element)) {
            return errorHandler.element;
        }

        // 最近可见ngModelGroup
        if (control.parent && control.parent !== this.ngForm.control) {
            return this.findClosestVisibleItem(control.parent);
        }

        // 没有找到符合元素，此表单域会被滚动定位忽略
        return null;
    }

    private resetControls(controls: { [ key: string ]: AbstractControl; } = this.ngForm.controls) {
        // 表单值重置
        // PS: 设置了standalone的表单域/表单组无法重置。使用form.reset()只能重置view，不能重置对应model
        this.ngForm.reset();

        // 表单状态还原
        this.markAllControlsPristine();

        // 关闭错误提示
        if (this.errorHandlers) {
            this.errorHandlers.forEach(eh => eh.whenValid());
        }
    }

    private markAllControlsPristine(controls: { [ key: string ]: AbstractControl; } = this.ngForm.controls) {
        for (let name in controls) {
            controls[ name ].markAsPristine();
            if (controls[ name ] instanceof FormGroup) {
                this.markAllControlsPristine((controls[ name ] as FormGroup).controls);
            }
        }
    }

}