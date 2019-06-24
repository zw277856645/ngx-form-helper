import {
    Input, ElementRef, Directive, OnDestroy, HostListener, AfterViewInit, NgZone, Inject, Renderer2, Output, Optional,
    QueryList, InjectionToken, EventEmitter, ContentChildren
} from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { forkJoin, interval, Observable, of, Subscription } from 'rxjs';
import { FormHelperConfig } from './form-helper-config';
import { async2Observable, getProxyElement, noop, splitClassNames } from './utils';
import { catchError, first, map, skipWhile, switchMap } from 'rxjs/operators';
import { ErrorHandler } from './error-handler/error-handler';
import { SubmitHandler } from './submit-handler/submit-handler';
import { getOffset, getScrollTop, isVisible, setScrollTop } from 'cmjs-lib';

const TWEEN = require('@tweenjs/tween.js');

export const FORM_HELPER_CONFIG = new InjectionToken<FormHelperConfig>('form_helper_config');

/**
 * validators
 *  1)trimmedRequired
 *
 * angular表单存在的bug
 *  1)bug：当使用ngFor迭代表单域，且name使用数组下标(如：name-{{i}})，此时若动态新增/删除表单域，会造成表单域数量混乱
 *    fix：这种情况下请保证name唯一，且必须使用trackBy返回唯一标识，推荐使用uuid等工具(如：name-{{uuid}})
 *
 * 设计不好的地方
 *  1)request采用输入属性，用户需要使用[request]="callback.bind(this)"的形式保证this的正确指向
 *  2)加载message不友好，格式为validator[.async][.order]
 *    原因：指定async是因为AbstractControl无法获取已设定的验证器，因此无法自动识别验证器同步异步
 *         指定order是因为页面被浏览器解析后属性顺序是不确定的，跟源代码书写顺序无关
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

    @Input() autoReset: boolean = true;

    @Input() context: Window | HTMLElement | string = window;

    @Input() scrollProxy: string;

    @Input() autoScroll: boolean = true;

    @Input() offsetTop: number = 0;

    @Input() validateImmediate: boolean;

    @Input() classNames: string | false = 'fh-theme';

    @Input() errorClassNames: string | false = 'fh-error';

    @Input() errorGroupClassNames: string | false = 'fh-group-error';

    // 验证通过时的请求
    @Input() request: Observable<any> | Promise<any> | Function | any;

    @Input() requestOkAssertion: (res: any) => boolean;

    // 验证不通过
    @Output() fail = new EventEmitter();

    // request请求完成后的响应，参数为request的返回值
    @Output() response = new EventEmitter();

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

    constructor(public ngForm: NgForm,
                private eleRef: ElementRef,
                private zone: NgZone,
                private renderer: Renderer2,
                @Optional() @Inject(FORM_HELPER_CONFIG) private overrideConfig: FormHelperConfig) {
        Object.assign(this, overrideConfig);
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

            let requestError = false;

            async2Observable(this.request).pipe(catchError(() => of(requestError = true))).pipe(
                switchMap(res => async2Observable(submitHandler ? submitHandler.end() : noop()).pipe(
                    map(() => {
                        if (!requestError) {
                            let assertSuc = true;

                            try {
                                if (typeof this.requestOkAssertion === 'function') {
                                    assertSuc = this.requestOkAssertion(res);
                                }
                            } catch (e) {
                                // tslint:disable-next-line:no-console
                                console.error(e);
                            }

                            if (assertSuc) {
                                this.response.emit(res);

                                if (this.autoReset) {
                                    this.reset();
                                }
                            }
                        }
                    }),
                    catchError(() => of())
                ))
            ).subscribe();
        } else {
            this.validateControls();

            this.fail.emit();

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
        let control: AbstractControl;
        let pds: Observable<any>[];

        for (let name in controls) {
            control = controls[ name ];

            if (control instanceof FormGroup) {
                pds = this.getPendingControls(control.controls);

                if (pds.length) {
                    pendings.push(...pds);
                }

                continue;
            }

            if (control.enabled && control.pending) {
                pendings.push(interval(100).pipe(skipWhile(() => control.pending), first()));
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
        // 表单状态还原
        this.markAllControlsPristine();

        // 表单值重置
        // PS: 设置了standalone的表单域/表单组无法重置。使用form.reset()只能重置view，不能重置对应model
        this.ngForm.reset();

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