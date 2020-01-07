import {
    AfterViewInit, ContentChildren, Directive, ElementRef, EventEmitter, HostListener, Inject, InjectionToken, Input,
    NgZone, OnDestroy, Optional, Output, Provider, QueryList, Renderer2, SkipSelf
} from '@angular/core';
import {
    AbstractControl, AbstractControlDirective, ControlContainer, FormArray, FormGroup, NgForm
} from '@angular/forms';
import { forkJoin, interval, Observable, Subscription } from 'rxjs';
import { FormHelperConfig } from './form-helper-config';
import { arrayOfAbstractControls, arrayProviderFactory, getProxyElement, splitClassNames } from './utils';
import { first, skipWhile } from 'rxjs/operators';
import { SubmitHandler } from './submit-handler/submit-handler';
import { getOffset, getScrollTop, InputBoolean, InputNumber, isVisible, setScrollTop } from '@demacia/cmjs-lib';
import { ErrorHandler, RefType } from './error-handler/error-handler';
import { CompleteConfig, SubmitComplete } from './submit-complete';

/**
 * @ignore
 */
const TWEEN = require('@tweenjs/tween.js');

/**
 * @ignore
 */
export type ArrayOrGroupAbstractControls = { [ key: string ]: AbstractControl } | AbstractControl[];

/**
 * @ignore
 */
export const FORM_HELPER_CONFIG = new InjectionToken<FormHelperConfig>('form_helper_config');

/**
 * @ignore
 */
export const FORM_HELPER_CONFIG_ARRAY = new InjectionToken<FormHelperConfig[]>('form_helper_config_array');

/**
 * [FormHelperDirective]{@link FormHelperDirective} 全局配置
 *
 * ~~~ js
 * \@NgModule({
 *     ...
 *     providers: [
 *         formHelperConfigProvider({
 *             autoReset: false,
               offsetTop: 100
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
 * 插件的控制中心
 *
 * ---
 *
 * **`angular 表单存在的 BUG`**
 *
 * - bug：当使用 ngFor 迭代表单域，且 name 使用数组下标(如：name-{{i}})，此时若动态新增/删除表单域，会造成表单域混乱<br>
 *   fix：这种情况下请保证 name 唯一，且必须使用 trackBy 返回唯一标识，推荐使用 uuid 等工具(如：name-{{uuid}})
 *
 * <example-url>/ngx-form-helper/demo/index.html</example-url>
 */
@Directive({
    selector: '[formHelper]',
    exportAs: 'formHelper'
})
export class FormHelperDirective implements OnDestroy, AfterViewInit {

    /**
     * @ignore
     */
    @ContentChildren(ErrorHandler, { descendants: true }) errorHandlers: QueryList<ErrorHandler>;

    /**
     * @ignore
     */
    @ContentChildren('reset') set resets(resets: QueryList<ElementRef>) {
        resets.filter(reset => this.resetEles.indexOf(reset.nativeElement) < 0)
              .forEach(reset => {
                  this.resetEles.push(reset.nativeElement);
                  this.subscription.add(this.renderer.listen(reset.nativeElement, 'click', () => this.reset()));
              });
    }

    /**
     * @ignore
     */
    @ContentChildren('submit') set submits(submits: QueryList<ElementRef>) {
        submits.filter(submit => this.submitEles.indexOf(submit.nativeElement) < 0)
               .forEach(submit => {
                   this.submitEles.push(submit.nativeElement);
                   this.subscription.add(this.renderer.listen(submit.nativeElement, 'click', () => this.submit()));
               });
    }

    /**
     * 表单所处上下文，通常为 window 或含有滚动条的 DOM 元素，影响滚动条正确滚动到第一条错误。
     * 当类型为 string 时，支持 css选择器 和`点号表达式`
     *
     * ---
     *
     * **点号表达式语法**
     *
     * . => 当前节点，.. => 父节点，../../ etc
     *
     * **点号表达式示例**
     *
     * 设置当前 form 元素为滚动对象
     *
     * ~~~ html
     * <form formHelper context="."></form>
     * ~~~
     *
     * 设置当前 form `父元素`为滚动对象，本例指 id="parent" 的 div
     *
     * ~~~ html
     * <div id="parent">
     *   <form formHelper context=".."></form>
     * </div>
     * ~~~
     *
     * 设置当前 form `祖先元素`为滚动对象，本例指 id="ancestor" 的 div
     *
     * ~~~ html
     * <div id="ancestor">
     *   <div id="parent">
     *     <form formHelper context="../../"></form>
     *   </div>
     * </div>
     * ~~~
     */
    @Input() context: Window | ElementRef | HTMLElement | string = window;

    /**
     * 表单域/表单组的滚动代理。默认滚动到错误域本身，但当错误域本身处于不可见状态时，插件无法知道应该滚动到何处，
     * 此时可使用另一个可见对象作为代理。 若没有设置滚动代理，且错误域本身不可见，会默认寻找其父域直到 ngForm，
     * 使用第一个可见域作为代理
     *
     * - 全局配置，可被表单域/表单组自身相同配置覆盖，[参见]{@link ErrorHandler#scrollProxy}
     *
     * ---
     *
     * **语法**
     *
     * ^ => 父节点，~ => 前一个兄弟节点，+ => 后一个兄弟节点，可与数字任意组合，示例：^^^，^2，~3^4+2
     */
    @Input() scrollProxy: string;

    /**
     * 是否开启自动滚动到第一个错误域功能
     */
    @Input() @InputBoolean() autoScroll: boolean = true;

    /**
     * 滚动定位使用，错误域距离浏览器顶部偏移量。默认滚动到第一个错误域与浏览器可视区域顶部重合处，
     * 但大多数情况下页面是 有绝对定位(absolute)或固定定位(fixed)的头部的，此时会盖住滚动到此的错误域，
     * 通过设置 offsetTop 解决此问题
     */
    @Input() @InputNumber() offsetTop: number = 0;

    /**
     * 设置表单域/表单组是否`初始`就显示错误。默认只在控件 dirty 状态触发错误显示，所以表单初始不会显示错误，
     * 当用户修改了表单或点提交按钮后才会显示错误
     *
     * - 全局配置，可被表单域/表单组自身相同配置覆盖，[参见]{@link ErrorHandler#validateImmediate}
     */
    @Input() @InputBoolean() validateImmediate: boolean = false;

    /**
     * 设置`表单组`是否`初始`就显示其所有`子域`的错误。此配置仅在`全局(formHelper) validateImmediate = false` 和
     * `表单组自身 validateImmediate = true` 的条件下才有效，且只对`表单组`有效
     *
     * - 全局配置，可被表单域/表单组自身相同配置覆盖，[参见]{@link ErrorHandler#validateImmediateDescendants}
     *
     * ---
     *
     * 如下示例，group 控件自身验证状态变化时，`会`同时触发所有子域的验证
     *
     * ~~~ html
     * <form formHelper [validateImmediate]="false">
     *   <div ngModelGroup="group" ehSimple [validateImmediate]="true">
     *     ...
     *   </div>
     * </form>
     * ~~~
     *
     * 如下示例，group 控件自身验证状态变化时，`不会`同时触发所有子域的验证
     *
     * ~~~ html
     * <form formHelper [validateImmediate]="false">
     *   <div ngModelGroup="group" ehSimple [validateImmediate]="true" [validateImmediateDescendants]="false">
     *     ...
     *   </div>
     * </form>
     * ~~~
     */
    @Input() @InputBoolean() validateImmediateDescendants: boolean = true;

    /**
     * 主题样式
     *
     * - 指定的字符串会添加到 form 类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式
     */
    @Input() classNames: string = 'fh-theme';

    /**
     * 验证失败时`表单域`自动添加的类名
     *
     * ---
     *
     * **附加样式**
     *
     * 表单域添加 `ignore` 类，将忽略给该元素设置验证失败样式
     *
     * ~~~ html
     * <input type="text" class="ignore" name="name" [(ngModel)]="xxx" required>
     * ~~~
     *
     * 表单域添加 `thin` 类，将设置元素左边框为细边框样式
     *
     * ~~~ html
     * <input type="text" class="thin" name="name" [(ngModel)]="xxx" required>
     * ~~~
     */
    @Input() errorClassNames: string = 'fh-error';

    /**
     * 验证失败时`表单组`自动添加的类名。默认主题没有为 `fh-group-error` 设置样式，用户可在自己的样式文件中定义具体样式
     */
    @Input() errorGroupClassNames: string = 'fh-group-error';

    /**
     * 验证通过事件。事件会传递 [`SubmitComplete`]{@link SubmitComplete} 方法
     *
     * ~~~ html
     * <form formHelper (validPass)="save($event)"> ... </form>
     * ~~~
     *
     * ~~~ js
     * \@Component({ ... })
     * export class ExampleComponent {
     *
     *     constructor(private exampleService: ExampleService) {
     *     }
     *
     *     save(complete: SubmitComplete) {
     *         this.exampleService.save().subscribe(res => {
     *             // do something
     *             ...
     *
     *             // 固定写法，插件收尾处理
     *             complete();
     *         });
     *     }
     * }
     * ~~~
     */
    @Output() validPass = new EventEmitter<SubmitComplete>();

    /**
     * 验证不通过事件
     */
    @Output() validFail = new EventEmitter();

    /**
     * @ignore
     */
    @HostListener('keydown', [ '$event' ]) onKeydown(event: KeyboardEvent) {
        if ((event.keyCode || event.which) === 13
            && ((event.target || event.srcElement) as Element).nodeName.toUpperCase() !== 'TEXTAREA') {
            event.preventDefault();
        }
    }

    /**
     * @ignore
     */
    @HostListener('window:resize') onResize() {
        this.errorHandlers.forEach(eh => {
            if (eh.reposition) {
                eh.reposition();
            }
        });
    }

    /**
     * 表单的 dom 元素
     */
    form: HTMLFormElement;

    /**
     * @ignore
     */
    submitted: boolean;

    private subscription = new Subscription();
    private resetEles: Element[] = [];
    private submitEles: Element[] = [];

    /**
     * @ignore
     */
    constructor(public ngForm: ControlContainer,
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

    /**
     * 提交处理函数，不需要用户调用，通常在实现自定义的提交处理指令时需要
     *
     * @param submitHandler 提交处理组件实例对象
     */
    submit(submitHandler?: SubmitHandler) {
        this.submitted = true;

        if (this.ngForm.valid) {
            if (submitHandler) {
                submitHandler.start();
            }

            this.validPass.emit((config?: CompleteConfig) => {
                let cfg = Object.assign({ delay: 0 }, config);
                let handler: Function;

                if (submitHandler) {
                    handler = () => {
                        submitHandler.end(() => {
                            if (cfg.reset) {
                                this.reset();
                            }
                        });
                    };
                } else {
                    handler = () => {
                        if (cfg.reset) {
                            this.reset();
                        }
                    };
                }

                if (typeof cfg.delay === 'number' && cfg.delay >= 0) {
                    setTimeout(() => handler(), cfg.delay);
                } else {
                    handler();
                }
            });
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

    /**
     * 重置
     *
     * ---
     *
     * 在重置按钮使用了`#reset`模板变量时可省略调用
     *
     * ~~~ html
     * <form formHelper>
     *   <button type="button" #reset>重置</button>
     * </form>
     * ~~~
     *
     * 绑定事件方式
     *
     * ~~~ html
     * <form formHelper #formHelperCtrl="formHelper">
     *   <button type="button" (click)="formHelperCtrl.reset()">重置</button>
     * </form>
     * ~~~
     */
    reset() {
        this.submitted = false;
        this.resetControls();
    }

    /**
     * 重定位错误消息。页面布局变化时，某些绝对定位错误消息位置可能需要重新定位。window:resize 事件已被插件处理，
     * 会自动重定位错误消息，其他情况需要手动调用此方法
     *
     * ~~~ html
     * <form formHelper #formHelperCtrl="formHelper">
     *   <div ngModelGroup="group">
     *     ...
     *   </div>
     *   <button type="button" (click)="formHelperCtrl.repositionMessages('group')">重定位消息</div>
     * </form>
     * ~~~
     *
     * @param type 需要重定位错误信息关联的表单控件指引，当控件为`表单组`时，其`子域`也会同时重定位。省略参数将重定位所有错误消息
     * @param delay 延时时间
     */
    repositionMessages(type?: RefType | AbstractControl, delay?: number) {
        if (!type) {
            this.errorHandlers.forEach(errorHandler => {
                if (errorHandler.reposition) {
                    if (isVisible(errorHandler.element)) {
                        errorHandler.reposition();
                    } else {
                        setTimeout(() => errorHandler.reposition(), delay || 0);
                    }
                }
            });
        } else {
            let errorHandler: ErrorHandler;

            if (typeof type === 'string') {
                errorHandler = this.errorHandlers.find(eh => eh.controlName === type);
            } else if (type instanceof AbstractControlDirective) {
                errorHandler = this.errorHandlers.find(eh => eh.control === type.control);
            } else if (type instanceof AbstractControl) {
                errorHandler = this.errorHandlers.find(eh => eh.control === type);
            }

            if (errorHandler) {
                if (errorHandler.reposition) {
                    if (isVisible(errorHandler.element)) {
                        errorHandler.reposition();
                    } else {
                        setTimeout(() => errorHandler.reposition(), delay || 0);
                    }
                }

                // 继续重定位后代错误消息
                if (errorHandler.control instanceof FormGroup || errorHandler.control instanceof FormArray) {
                    arrayOfAbstractControls(errorHandler.control.controls)
                        .forEach(item => this.repositionMessages(item.control, delay));
                }
            }
        }
    }

    /**
     * 控件树，屏蔽了`模板驱动`和`模型驱动`表单之间的差异
     */
    get controls() {
        if (this.ngForm instanceof NgForm) {
            return this.ngForm.controls;
        } else {
            return (this.ngForm.control as FormGroup).controls;
        }
    }

    private static validateControl(control: AbstractControl) {
        // 设置control为dirty状态，使错误信息显示
        control.markAsDirty();

        // 触发control.statusChanges。默认会自动触发FormGroup的状态检测
        control.updateValueAndValidity();
    }

    private validateControls(controls: ArrayOrGroupAbstractControls = this.controls) {
        arrayOfAbstractControls(controls).forEach(item => {
            FormHelperDirective.validateControl(item.control);

            if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                this.validateControls(item.control.controls);
            }
        });
    }

    private getPendingControls(controls: ArrayOrGroupAbstractControls = this.controls) {
        let pendings: Observable<any>[] = [];

        arrayOfAbstractControls(controls).forEach(item => {
            if (item.control.enabled && item.control.pending) {
                pendings.push(interval(100).pipe(skipWhile(() => item.control.pending), first()));
            }
            if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                pendings.push(...this.getPendingControls(item.control.controls));
            }
        });

        return pendings;
    }

    private scrollToTopError() {
        let context = this.findContext() || window;

        if (!context) {
            return;
        }

        let minOffsetTop = this.calcMinOffsetTop();

        if (minOffsetTop === Number.MAX_SAFE_INTEGER) {
            minOffsetTop = getOffset(this.form).top;
        }

        minOffsetTop -= this.offsetTop;

        // 非window滚动窗体中表单域实际offsetTop需要减去滚动体offsetTop，加上滚动体当前scrollTop
        if (context !== window && context instanceof HTMLElement && context.nodeName.toUpperCase() !== 'HTML') {
            minOffsetTop -= getOffset(context).top;
            minOffsetTop += context.scrollTop;
        }

        let curScrollTop = getScrollTop(context);

        // 如果待滚到位置在可视窗口内，则忽略
        if (minOffsetTop >= curScrollTop) {
            return;
        }

        let animationRequest: number;
        let currentTween = new TWEEN.Tween({ y: curScrollTop })
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
                return document.querySelector(this.context);
            }
        } else if (this.context instanceof ElementRef) {
            return this.context.nativeElement;
        } else {
            return this.context;
        }
    }

    private calcMinOffsetTop(controls: ArrayOrGroupAbstractControls = this.controls) {
        let minOffsetTop = Number.MAX_SAFE_INTEGER;
        let offsetTop: number;
        let closestVisibleElement: HTMLElement;

        for (let item of arrayOfAbstractControls(controls)) {
            if (item.control.enabled && item.control.invalid) {
                // 跳过ngModelGroup，由其子控件计算合适的元素
                if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                    offsetTop = this.calcMinOffsetTop(item.control.controls);

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

                closestVisibleElement = this.findClosestVisibleItem(item.control) as HTMLElement;
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
        if (!errorHandler || !errorHandler.controlElement) {
            return null;
        }

        // 优先使用滚动代理
        let proxyEle = getProxyElement(errorHandler.controlElement, errorHandler.scrollProxy);
        if (proxyEle && isVisible(proxyEle)) {
            return proxyEle;
        }

        // 表单域本身
        if (isVisible(errorHandler.controlElement)) {
            return errorHandler.controlElement;
        }

        // 最近可见父组件
        if (control.parent && control.parent !== this.ngForm.control) {
            return this.findClosestVisibleItem(control.parent);
        }

        // 没有找到符合元素，此表单域会被滚动定位忽略
        return null;
    }

    private resetControls() {
        // 表单域值重置
        // PS: 设置了standalone的表单域无法重置。使用form.reset()只能重置view，不能重置对应model
        this.ngForm.reset();

        // 表单域状态还原
        this.markAllControlsPristine();

        // 关闭错误提示
        if (this.errorHandlers) {
            this.errorHandlers.forEach(eh => eh.whenValid && eh.whenValid());
        }
    }

    private markAllControlsPristine(controls: ArrayOrGroupAbstractControls = this.controls) {
        arrayOfAbstractControls(controls).forEach(item => {
            item.control.markAsPristine({ onlySelf: true });

            if (item.control instanceof FormGroup || item.control instanceof FormArray) {
                this.markAllControlsPristine(item.control.controls);
            }
        });
    }

}