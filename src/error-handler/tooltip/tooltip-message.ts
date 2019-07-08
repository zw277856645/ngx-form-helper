export class Message {

    // 验证不通过时显示的消息
    message: string;

    // 验证规则是否是异步
    async?: boolean;

    // 顺序
    order?: number;

    // 消息占位符被替换时的上下文环境
    context?: any;
}

export class TooltipMessage extends Message {

    // 验证规则对应的名称
    error: string;
}