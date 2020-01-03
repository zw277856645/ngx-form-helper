import {
    AfterViewInit, Component, ElementRef, HostBinding, Inject, InjectionToken, Input, NgZone, OnChanges, OnInit,
    Optional, Provider, Renderer2, SimpleChanges, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { ErrorHandlerTooltipConfig, TooltipPosition } from './error-handler-tooltip-config';
import { FormHelperDirective } from '../../form-helper.directive';
import { Message, TooltipMessage } from './tooltip-message';
import { arrayProviderFactory, getProxyElement } from '../../utils';
import { getOuterHeight, getOuterWidth, getStyle, InputNumber, isHidden } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
export const ERROR_HANDLER_TOOLTIP_CONFIG
    = new InjectionToken<ErrorHandlerTooltipConfig>('error_handler_tooltip_config');

/**
 * @ignore
 */
export const ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTooltipConfig[]>('error_handler_tooltip_config_array');

/**
 * [ErrorHandlerTooltipComponent]{@link ErrorHandlerTooltipComponent} 全局配置
 *
 * ~~~ js
 * \@NgModule({
 *     ...
 *     providers: [
 *         errorHandlerTooltipConfigProvider({
 *             fontSize: 14
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
export function errorHandlerTooltipConfigProvider(config: ErrorHandlerTooltipConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TOOLTIP_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY ]
            ]
        }
    ];
}

/**
 * 作用：标签形式的错误消息<br>
 * 特色：绝对定位，所有错误消息同时展示，动态切换消息状态，异步验证有 loading 反馈
 *
 * ---
 *
 * 消息内容为文本节点
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-tooltip ref="name">
 *   <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
 *   <eh-tooltip-message error="pattern">请输入字符</eh-tooltip-message>
 * </eh-tooltip>
 * ~~~
 *
 * 消息内容为 message 属性
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-tooltip ref="name">
 *   <eh-tooltip-message error="required" message="不能为空"></eh-tooltip-message>
 *   <eh-tooltip-message error="pattern" message="请输入字符"></eh-tooltip-message>
 * </eh-tooltip>
 * ~~~
 *
 * 消息对象为 errorMessages 属性
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-tooltip ref="name" [errorMessages]="messages"></eh-tooltip>
 * ~~~
 *
 * ~~~ js
 * \@Component({ ... })
 * export class SimpleComponent {
 *
 *     // 有序
 *     messages = [
 *         { error: "required", message: "不能为空" },
 *         { error: "pattern", message: "请输入字符", order: 0, async: false, context: null }
 *     ];
 *
 *     // 无序 - 字符串
 *     // 此方式将不能定义 order、async、context
 *     messages = {
 *         required: "不能为空",
 *         pattern: "请输入字符"
 *     };
 *
 *     // 无序 - 对象
 *     messages = {
 *         required: { message: "不能为空", order: 0, async: false, context: null },
 *         pattern: { message: "请输入字符", order: 0, async: false, context: null }
 *     };
 * }
 * ~~~
 */
@Component({
    selector: 'eh-tooltip',
    templateUrl: './error-handler-tooltip.component.html',
    styleUrls: [ './error-handler-tooltip.component.less' ],
    providers: [
        {
            provide: ErrorHandler,
            useExisting: ErrorHandlerTooltipComponent
        }
    ],
    exportAs: 'ehTooltip'
})
export class ErrorHandlerTooltipComponent extends ErrorHandler implements AfterViewInit, OnInit, OnChanges {

    /**
     * 消息定义对象。可使用占位符，占位符使用的上下文环境是`用户设定`的 [context]{@link Message#context} 属性
     *
     * ~~~ js
     * messages = {
     *     listRequired: '不能为空',
     *     listRequiredMin: { message: '至少设置{{value}}个值', context: { value: 2 } },
     *     listRequiredMax: { message: '至多设置{{value}}个值', context: { value: 4 } }
     * };
     * ~~~
     *
     * ~~~ html
     * <input type="text" name="loves" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
     * <eh-text ref="loves" [errorMessages]="messages"></eh-text>
     * ~~~
     *
     * ---
     *
     * **注意：**
     *
     * 与 eh-text 不同的是，eh-text 占位符上下文环境是`验证方法返回`的错误体本身，而 eh-tooltip 是`用户设定`的 context 属性，
     * 之所以不能使用验证方法返回的错误体本身是因为 eh-tooltip 需要初始显示所有的错误消息，但含有占位符的消息仅当相应的
     * 错误发生时才能替换占位符，所以初始无法获知所有上线文环境
     */
    @Input() errorMessages: TooltipMessage[] | { [ error: string ]: Message | string };

    /**
     * 主题样式
     *
     * - 指定的字符串会添加到组件所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式
     */
    @Input() classNames: string = 'eh-tooltip-theme';

    /**
     * x轴偏移，用来微调错误消息位置
     */
    @Input() @InputNumber() offsetX: number = 0;

    /**
     * y轴偏移，用来微调错误消息位置
     */
    @Input() @InputNumber() offsetY: number = 0;

    /**
     * 提示相对表单域/表单组的位置
     */
    @Input() position: TooltipPosition = TooltipPosition.BOTTOM_RIGHT;

    /**
     * 错误消息定位代理
     *
     * - 默认相对于表单域/表单组本身定位，可使用任意其他元素作为代理
     * - 代理元素必须包含在错误消息直接父元素下。 语法：参见 [formHelper 的 scrollProxy]{@link FormHelperDirective#scrollProxy}
     * - `参照物为关联的表单域/表单组，而不是错误消息自身`
     */
    @Input() positionProxy: string;

    /**
     * 字体大小
     */
    @HostBinding('style.font-size.px') @Input() @InputNumber() fontSize: number = 13;

    /**
     * z-index 值
     */
    @HostBinding('style.z-index') @Input() @InputNumber() zIndex: number = 1;

    /**
     * 显示/隐藏动画时长(ms)
     */
    @HostBinding('style.transition-duration.ms') @Input() @InputNumber() duration: number = 200;

    /**
     * @ignore
     *
     * 消息显示/隐藏
     */
    @HostBinding('class.visible') visible: boolean;

    /**
     * @ignore
     */
    @HostBinding('class.valid') valid: boolean;

    /**
     * @ignore
     */
    @HostBinding('class.invalid') invalid: boolean;

    /**
     * @ignore
     */
    @HostBinding('class.pending') pending: boolean;

    /**
     * @ignore
     */
    messages: TooltipMessage[];

    private proxyEle: HTMLElement;

    /**
     * @ignore
     */
    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                private zone: NgZone,
                @SkipSelf() private formHelper: FormHelperDirective,
                // tslint:disable-next-line:prefer-inline-decorator
                @Optional() @Inject(ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTooltipConfig[]) {
        super(eleRef, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngOnInit() {
        super.ngOnInit();

        this.addClasses(this.element, this.classNames);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errorMessages) {
            this.messages = ErrorHandlerTooltipComponent.convertErrorMessages2Array(this.errorMessages);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        if (getStyle(this.element.parentElement, 'position') === 'static') {
            this.renderer.setStyle(this.element.parentElement, 'position', 'relative');
        }

        this.addClasses(this.element, this.position);
    }

    /**
     * @ignore
     */
    whenValid() {
        this.visible = false;
        this.hostStatusChange();
    }

    /**
     * @ignore
     */
    whenInvalid() {
        this.visible = true;
        this.hostStatusChange();

        // setTimeout保证动态表单域创建完毕后执行
        setTimeout(() => this.reposition());
    }

    /**
     * @ignore
     */
    whenPending() {
        this.hostStatusChange();
    }

    /**
     * 错误消息重定位，插件自动调用，当出现插件无法跟踪的页面布局变化时，需要用户手动调用
     *
     * - `当控件为表单组时也只重定位自身错误消息`，如需同时重定位子域错误消息，请使用
     * [formHelper 的 repositionMessages]{@link FormHelperDirective#repositionMessages}
     *
     * ---
     *
     * 重定位示例，textarea 高度变化时，重定位错误消息
     *
     * ~~~ html
     * <textarea name="name" required autoSize (sizeChange)="nameCtrl.reposition()"></textarea>
     * <eh-tooltip ref="name" #nameCtrl="ehTooltip">
     *   <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
     * </eh-tooltip>
     * ~~~
     */
    reposition() {
        this.zone.runOutsideAngular(() => {
            let parent = this.element.parentElement;

            if (isHidden(parent)) {
                return;
            }

            if (!this.proxyEle) {
                let proxy = this.positionProxy ? getProxyElement(this.controlElement, this.positionProxy) : null;
                this.proxyEle = (proxy || this.controlElement) as HTMLElement;
            }

            // proxyEle必须包含在消息的parent之中
            if (!parent.contains(this.proxyEle) || parent === this.proxyEle) {
                throw new Error(this.controlName + '：表单域或其定位代理必须在'
                    + '与之关联的 eh-tooltip 的直接父元素下');
            }

            let parentWidth = getOuterWidth(parent),
                parentHeight = getOuterHeight(parent),

                proxyWidth = getOuterWidth(this.proxyEle),
                proxyHeight = getOuterHeight(this.proxyEle),

                selfWidth = getOuterWidth(this.element),
                selfHeight = getOuterHeight(this.element);

            // proxy到parent之间可能有多个定位父元素，需要计算出proxy到parent的offset累加值
            let tmp = this.proxyEle,
                offsetTop = 0,
                offsetLeft = 0;

            do {
                offsetTop += tmp.offsetTop;
                offsetLeft += tmp.offsetLeft;
                tmp = tmp.offsetParent as HTMLElement;
            } while (tmp !== parent && parent.contains(tmp));

            switch (this.position) {
                default:
                case TooltipPosition.BOTTOM_RIGHT:
                    this.setStyle('top', offsetTop + proxyHeight + this.offsetY + 'px');
                    this.setStyle('right', parentWidth - offsetLeft - proxyWidth + this.offsetX + 'px');
                    break;
                case TooltipPosition.BOTTOM_CENTER:
                    this.setStyle('top', offsetTop + proxyHeight + this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + (proxyWidth / 2) - (selfWidth / 2) + this.offsetX + 'px');
                    break;
                case TooltipPosition.BOTTOM_LEFT:
                    this.setStyle('top', offsetTop + proxyHeight + this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + this.offsetX + 'px');
                    break;
                case TooltipPosition.TOP_RIGHT:
                    this.setStyle('right', parentWidth - offsetLeft - proxyWidth + this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + this.offsetY + 'px');
                    break;
                case TooltipPosition.TOP_CENTER:
                    this.setStyle('left', offsetLeft + (proxyWidth / 2) - (selfWidth / 2) + this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + this.offsetY + 'px');
                    break;
                case TooltipPosition.TOP_LEFT:
                    this.setStyle('left', offsetLeft + this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + this.offsetY + 'px');
                    break;
                case TooltipPosition.LEFT_CENTER:
                    this.setStyle('top', offsetTop + (proxyHeight / 2) - (selfHeight / 2) + this.offsetY + 'px');
                    this.setStyle('right', parentWidth - offsetLeft + this.offsetX + 'px');
                    break;
                case TooltipPosition.RIGHT_CENTER:
                    this.setStyle('top', offsetTop + (proxyHeight / 2) - (selfHeight / 2) + this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + proxyWidth + this.offsetX + 'px');
                    break;
            }
        });
    }

    /**
     * @ignore
     */
    trackByMessages(i: number, msg: TooltipMessage) {
        return msg.error;
    }

    private setStyle(style: string, value: any) {
        this.renderer.setStyle(this.element, style, value);
    }

    private hostStatusChange() {
        if (this.control) {
            this.valid = this.control.valid;
            this.invalid = this.control.invalid;
            this.pending = this.control.pending;
        } else {
            this.valid = this.invalid = this.pending = false;
        }
    }

    private static convertErrorMessages2Array(messages: TooltipMessage[] | { [ error: string ]: Message | string }) {
        let parsedMessages: TooltipMessage[] = [];

        if (Array.isArray(messages)) {
            parsedMessages = messages || parsedMessages;
        } else if (messages !== null && typeof messages === 'object') {
            for (let error in messages) {
                let message = messages[ error ];

                if (typeof message === 'string') {
                    parsedMessages.push({ error, message });
                } else if (message !== null && typeof message === 'object') {
                    parsedMessages.push({ error, ...message });
                } else {
                    parsedMessages.push({ error, message: '' });
                }
            }
        }

        return parsedMessages.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

}