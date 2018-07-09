export interface ErrorHandlerTooltipConfig {

    // 如何查找tooltip的选择器
    selector?: string;

    // 查找tooltip的上下文代理，会在指定的代理对象子节点中寻找。语法同form-helper -> data-scroll-proxy
    // 默认为当前表单域/表单组的父元素
    contextProxy?: string;

    // 主题样式
    className?: string | false;

    // 提示相对表单域/表单组的位置
    position?: 'top left' | 'top center' | 'top right'
        | 'bottom left' | 'bottom center' | 'bottom right'
        | 'right center' | 'left center';

    // 显示动画。推荐使用animate.css
    animationIn?: string;

    // 隐藏动画
    animationOut?: string;

    // 动画时长(ms)
    duration?: number | false;
}