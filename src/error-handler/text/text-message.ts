/**
 * eh-text 使用的消息对象，[参见]{@link ErrorHandlerTextComponent#errorMessages}
 */
export class TextMessage {

    /**
     * 验证规则对应的名称
     */
    error: string;

    /**
     * 验证不通过时显示的消息
     */
    message: string;
}