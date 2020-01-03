import { Component, HostBinding, Input } from '@angular/core';
import { ErrorHandlerTextComponent } from './error-handler-text.component';

/**
 * 错误消息，&lt;eh-text&gt; 的子元素
 *
 * ~~~ html
 * <eh-text>
 *   <eh-text-message error="required">不能为空</eh-text-message>
 * </eh-text>
 * ~~~
 */
@Component({
    selector: 'eh-text-message',
    templateUrl: './error-handler-text-message.component.html'
})
export class ErrorHandlerTextMessageComponent {

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
     * <eh-text-message error="required" message="不能为空"></eh-text-message>
     * ~~~
     *
     * 2、文本节点方式
     * ~~~ html
     * <eh-text-message error="required">不能为空</eh-text-message>
     * ~~~
     */
    @Input() message: string;

    /**
     * @ignore
     */
    @HostBinding('class.active') get isError() {
        return this.errorHandlerText.hasError(this.error);
    }

    /**
     * @ignore
     */
    constructor(private errorHandlerText: ErrorHandlerTextComponent) {
    }
}