import {
    AfterViewInit, Directive, ElementRef, HostListener, Inject, InjectionToken, Input, OnChanges, Optional, Provider,
    Renderer2, SimpleChanges, SkipSelf
} from '@angular/core';
import { IconToggleStrategy, SubmitHandlerLoaderConfig } from './submit-handler-loader-config';
import { SubmitHandler } from './submit-handler';
import { FormHelperDirective } from '../form-helper.directive';
import { arrayProviderFactory, isNotFirstChange, splitClassNames } from '../utils';
import { InputBoolean, InputNumber } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
export const SUBMIT_HANDLER_LOADER_CONFIG =
    new InjectionToken<SubmitHandlerLoaderConfig>('submit_handler_loader_config');

/**
 * @ignore
 */
export const SUBMIT_HANDLER_LOADER_CONFIG_ARRAY =
    new InjectionToken<SubmitHandlerLoaderConfig[]>('submit_handler_loader_config_array');

/**
 * [SubmitHandlerLoaderDirective]{@link SubmitHandlerLoaderDirective} 全局配置
 *
 * ~~~ js
 * \@NgModule({
 *     ...
 *     providers: [
 *         submitHandlerLoaderConfigProvider({
 *             duration: 300
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
export function submitHandlerLoaderConfigProvider(config: SubmitHandlerLoaderConfig): Provider[] {
    return [
        {
            provide: SUBMIT_HANDLER_LOADER_CONFIG,
            useValue: config
        },
        {
            provide: SUBMIT_HANDLER_LOADER_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                SUBMIT_HANDLER_LOADER_CONFIG,
                [ new SkipSelf(), new Optional(), SUBMIT_HANDLER_LOADER_CONFIG_ARRAY ]
            ]
        }
    ];
}

/**
 * 防重复提交和设定等待请求返回前的 loading 反馈
 *
 * ~~~ html
 * <form formHelper>
 *   <button type="button" shLoader> ... </button>
 * </form>
 * ~~~
 */
@Directive({
    selector: '[shLoader]',
    exportAs: 'shLoader'
})
export class SubmitHandlerLoaderDirective implements SubmitHandler, OnChanges, AfterViewInit {

    /**
     * 全局主题样式
     *
     * - 指定的字符串会添加到指令所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式
     */
    @Input() classNames: string = 'sh-loader-theme';

    /**
     * 局部图标主题样式
     */
    @Input() iconClassNames: string = 'sh-loader-theme-icon';

    /**
     * 寻找图标的选择器，若找到，则使用`局部图标主题样式(iconClassNames)`，否则使用`全局主题样式(classNames)`
     */
    @Input() iconSelector: string = 'i.icon, i.fa';

    /**
     * 图标类名的替换策略，append: 在原有类名基础上增加，replace: 完全使用新类名替换原类名
     */
    @Input() iconToggleStrategy: IconToggleStrategy = IconToggleStrategy.APPEND;

    /**
     * 是否禁用主题样式
     */
    @Input() @InputBoolean() disableTheme: boolean = false;

    /**
     * loader最小动画时长(ms)，在此之间按钮不可点击(防重复提交)
     */
    @Input() @InputNumber() minDuration: number = 500;

    /**
     * 当 submit 元素在 form 外部时有用，使用此属性关联 formHelper 实例
     *
     * ---
     *
     * 提交按钮在表单内部
     *
     * ~~~ html
     * <form formHelper>
     *   <button type="button" shLoader>保存</button>
     * </form>
     * ~~~
     *
     * 提交按钮在表单外部
     *
     * ~~~ html
     * <form formHelper #formHelperCtrl="formHelper"></form>
     * <button type="button" shLoader [refForm]="formHelperCtrl">保存</button>
     * ~~~
     */
    @Input() refForm: FormHelperDirective;

    /**
     * @ignore
     */
    @HostListener('click') onClick() {
        let finalForm = this.formHelper || this.refForm;
        if (finalForm) {
            finalForm.submit(this);
        }
    }

    private readonly ele: HTMLElement;
    private loading: HTMLElement;
    private originIconClasses: string;
    private startTime: number;
    private flag: any;

    /**
     * @ignore
     */
    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private formHelper: FormHelperDirective,
                // tslint:disable-next-line:prefer-inline-decorator
                @Optional() @Inject(SUBMIT_HANDLER_LOADER_CONFIG_ARRAY)
                private overrideConfigs: SubmitHandlerLoaderConfig[]) {
        Object.assign(this, ...(overrideConfigs || []));
        this.ele = eleRef.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (isNotFirstChange(changes.iconSelector) && changes.iconSelector.currentValue) {
            this.ngAfterViewInit();
        }
    }

    ngAfterViewInit() {
        if (typeof this.iconSelector === 'string') {
            this.loading = this.ele.querySelector(this.iconSelector);
        }
        if (this.loading) {
            this.originIconClasses = this.loading.className;
        }
    }

    /**
     * @ignore
     */
    start() {
        this.startTime = new Date().getTime();

        if (this.ele instanceof HTMLButtonElement) {
            this.ele.disabled = true;
        } else {
            this.renderer.addClass(this.ele, 'disabled');
        }

        if (this.disableTheme) {
            return;
        }

        if (this.loading) {
            if (this.iconToggleStrategy === IconToggleStrategy.REPLACE) {
                this.loading.className = '';
            }
            if (getComputedStyle(this.loading).position === 'static') {
                this.renderer.setStyle(this.loading, 'position', 'relative');
            }

            this.addClasses(this.loading, this.iconClassNames);
        } else {
            this.addClasses(this.ele, this.classNames);
        }
    }

    /**
     * @ignore
     */
    end(cb?: () => void) {
        clearTimeout(this.flag);

        let diff = new Date().getTime() - this.startTime;
        let duration = diff < this.minDuration ? this.minDuration - diff : 0;

        if (duration > 0) {
            this.flag = setTimeout(() => this.doEnd(cb), duration);
        } else {
            this.doEnd(cb);
        }
    }

    private doEnd(cb?: () => void) {
        if (this.ele instanceof HTMLButtonElement) {
            this.ele.disabled = false;
        } else {
            this.renderer.removeClass(this.ele, 'disabled');
        }

        if (typeof cb === 'function') {
            cb();
        }

        if (this.disableTheme) {
            return;
        }

        if (this.loading) {
            this.removeClasses(this.loading, this.iconClassNames);

            if (this.iconToggleStrategy === IconToggleStrategy.REPLACE) {
                this.addClasses(this.loading, this.originIconClasses);
            }
        } else {
            this.removeClasses(this.ele, this.classNames);
        }
    }

    private addClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.addClass(ele, cls));
    }

    private removeClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.removeClass(ele, cls));
    }

}