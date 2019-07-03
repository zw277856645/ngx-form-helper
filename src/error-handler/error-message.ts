export class ErrorMessage {

    // 验证规则对应的名称
    error: string;

    // 验证不通过时显示的消息
    message: string;

    // 验证规则是否是异步
    async?: boolean;

    // 顺序
    order?: number;
}