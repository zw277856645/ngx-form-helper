import {
    Component, ElementRef, HostBinding, Inject, InjectionToken, Input, OnChanges, OnInit, Optional, Provider, Renderer2,
    SimpleChanges, SkipSelf, ViewChild
} from '@angular/core';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { arrayProviderFactory } from '../../utils';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorHandler } from '../error-handler';
import { TextMessage } from './text-message';
import { InputBoolean, InputNumber } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
export const ERROR_HANDLER_TEXT_CONFIG
    = new InjectionToken<ErrorHandlerTextConfig>('error_handler_text_config');

/**
 * @ignore
 */
export const ERROR_HANDLER_TEXT_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTextConfig[]>('error_handler_text_config_array');

/**
 * [ErrorHandlerTextComponent]{@link ErrorHandlerTextComponent} 全局配置
 *
 * ~~~ js
 * \@NgModule({
 *     ...
 *     providers: [
 *         errorHandlerTextConfigProvider({
 *             animation: 'flyLeft'
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
export function errorHandlerTextConfigProvider(config: ErrorHandlerTextConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TEXT_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TEXT_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TEXT_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TEXT_CONFIG_ARRAY ]
            ]
        }
    ];
}

/**
 * 作用：文本形式的错误消息<br>
 * 特色：当多个验证条件失败时，只显示其中一个错误消息，其他隐藏
 *
 * ---
 *
 * 消息内容为文本节点
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-text ref="name">
 *   <eh-text-message error="required">不能为空</eh-text-message>
 *   <eh-text-message error="pattern">请输入字符</eh-text-message>
 * </eh-text>
 * ~~~
 *
 * 消息内容为 message 属性
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-text ref="name">
 *   <eh-text-message error="required" message="不能为空"></eh-text-message>
 *   <eh-text-message error="pattern" message="请输入字符"></eh-text-message>
 * </eh-text>
 * ~~~
 *
 * 消息对象为 errorMessages 属性
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
 * <eh-text ref="name" [errorMessages]="messages"></eh-text>
 * ~~~
 *
 * ~~~ js
 * \@Component({ ... })
 * export class SimpleComponent {
 *
 *     // 有序，多个验证条件失败时，优先显示排在前面的错误消息
 *     messages = [
 *         { error: "required", message: "不能为空" },
 *         { error: "pattern", message: "请输入字符" }
 *     ];
 *
 *     // 无序，多个验证条件失败时，显示任意一个错误消息
 *     messages = {
 *         required: "不能为空",
 *         pattern: "请输入字符"
 *     };
 * }
 * ~~~
 */
@Component({
    selector: 'eh-text',
    templateUrl: './error-handler-text.component.html',
    styleUrls: [ './error-handler-text.component.less' ],
    providers: [
        {
            provide: ErrorHandler,
            useExisting: ErrorHandlerTextComponent
        }
    ],
    exportAs: 'ehText'
})
export class ErrorHandlerTextComponent extends ErrorHandler implements OnInit, OnChanges {

    /**
     * @ignore
     */
    @ViewChild('container', { static: false }) containerRef: ElementRef;

    /**
     * 消息定义对象。可使用占位符，占位符使用的上下文环境是`验证方法返回`的错误体本身
     *
     * ~~~ js
     * messages = {
     *     listRequired: '不能为空',
     *     listRequiredMin: '至少设置{{value}}个值',
     *     listRequiredMax: '至多设置{{value}}个值'
     * };
     * ~~~
     *
     * ~~~ html
     * <!--
     * 假如 model 数组长度少于2，则 minListNum 至少为2验证不成立，验证函数将返回
     * { listRequiredMin: { value: 2 } }，插件将使用该返回对象作为上下文环境替换占位符中匹配的字段
     * -->
     * <input type="text" name="loves" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
     * <eh-text ref="loves" [errorMessages]="messages"></eh-text>
     * ~~~
     */
    @Input() errorMessages: TextMessage[] | { [ error: string ]: string };

    /**
     * 主题样式
     *
     * - 指定的字符串会添加到组件所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式
     */
    @Input() classNames: string = 'eh-text-theme';

    /**
     * 消息显示动画，可选值有：fade、slideUp、slideDown、flyLeft、flyRight
     */
    @Input() animation: string;

    /**
     * 错误文本是否使用行内样式，对应 display: inline / block
     */
    @HostBinding('class.inline') @Input() @InputBoolean() inline: boolean = true;

    /**
     * 是否浮动，浮动时采用绝对定位
     */
    @HostBinding('class.float') @Input() @InputBoolean() float: boolean = false;

    /**
     * 错误文本是否右对齐
     */
    @HostBinding('class.right') @Input() @InputBoolean() right: boolean = false;

    /**
     * 字体大小
     */
    @HostBinding('style.font-size.px') @Input() @InputNumber() fontSize: number = 13;

    /**
     * x 轴偏移，用来微调错误消息位置
     */
    @HostBinding('style.left.px') @Input() @InputNumber() offsetX: number = 0;

    /**
     * y 轴偏移，用来微调错误消息位置
     */
    @HostBinding('style.top.px') @Input() @InputNumber() offsetY: number = 0;

    /**
     * @ignore
     *
     * 消息显示/隐藏
     */
    @HostBinding('class.visible') visible: boolean;

    /**
     * @ignore
     */
    messages: TextMessage[];

    /**
     * @ignore
     */
    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private formHelper: FormHelperDirective,
                // tslint:disable-next-line:prefer-inline-decorator
                @Optional() @Inject(ERROR_HANDLER_TEXT_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTextConfig[]) {
        super(eleRef, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngOnInit() {
        super.ngOnInit();

        this.addClasses(this.element, this.classNames);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errorMessages) {
            this.messages = ErrorHandlerTextComponent.convertErrorMessages2Array(this.errorMessages);
        }
    }

    /**
     * @ignore
     */
    whenValid() {
        this.visible = false;

        if (this.containerRef && this.animation) {
            this.removeClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    /**
     * @ignore
     */
    whenInvalid() {
        this.visible = true;

        if (this.containerRef && this.animation) {
            this.addClasses(this.containerRef.nativeElement, this.animation);
        }
    }

    /**
     * @ignore
     */
    whenPending() {
        this.whenValid();
    }

    /**
     * @ignore
     */
    trackByMessages(i: number, msg: TextMessage) {
        return msg.error;
    }

    private static convertErrorMessages2Array(messages: TextMessage[] | { [ error: string ]: string }) {
        let parsedMessages: TextMessage[] = [];

        if (Array.isArray(messages)) {
            parsedMessages = messages || parsedMessages;
        } else if (messages !== null && typeof messages === 'object') {
            for (let error in messages) {
                parsedMessages.push({ error, message: messages[ error ] });
            }
        }

        return parsedMessages;
    }

}