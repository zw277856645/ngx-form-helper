export class ErrorHandlerTextConfig {

    // 如何查找错误文本的选择器
    selector?: string;

    // 查找错误文本的上下文代理，会在指定的代理对象子节点中寻找。语法同form-helper -> data-scroll-proxy
    // 默认为当前表单域/表单组的父元素
    contextProxy?: string;

    // 主题样式
    className?: string | false;

    // 错误文本是否与表单域/表单组在同一行
    inline?: boolean;

    // 错误文本水平位置。只在inline=false的情况下有效
    align?: 'left' | 'center' | 'right';

    // 字体大小
    fontSize?: number;

}