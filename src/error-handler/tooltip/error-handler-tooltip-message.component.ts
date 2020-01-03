import { Component, HostBinding, Input } from '@angular/core';
import { ErrorHandlerTooltipComponent } from './error-handler-tooltip.component';
import { InputBoolean } from '@demacia/cmjs-lib';

/**
 * 错误消息，&lt;eh-tooltip&gt; 的子元素
 *
 * ~~~ html
 * <eh-tooltip>
 *   <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
 * </eh-tooltip>
 * ~~~
 */
@Component({
    selector: 'eh-tooltip-message',
    templateUrl: './error-handler-tooltip-message.component.html'
})
export class ErrorHandlerTooltipMessageComponent {

    /**
     * 错误类型
     *
     * - 由 angular 验证器 ([Validator]{@link https://www.angular.cn/api/forms/Validator}) 返回
     */
    @Input() error: string;

    /**
     * 错误类型对应的错误消息
     *
     * ---
     *
     * 有两种定义 message 的方式
     *
     * 1、属性方式
     * ~~~ html
     * <eh-tooltip-message error="required" message="不能为空"></eh-tooltip-message>
     * ~~~
     *
     * 2、文本节点方式
     * ~~~ html
     * <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
     * ~~~
     */
    @Input() message: string;

    /**
     * 标记消息验证是否为异步。当为异步验证时，pending 状态下会有 loading 反馈
     *
     * `插件无法自动识别，必须自行设置`
     */
    @Input() @InputBoolean() async: boolean = false;

    /**
     * @ignore
     */
    @HostBinding('style.display') display = 'block';

    /**
     * @ignore
     */
    constructor(private errorHandlerTooltip: ErrorHandlerTooltipComponent) {
    }

    /**
     * @ignore
     */
    get isError() {
        return this.errorHandlerTooltip.hasError(this.error);
    }
}