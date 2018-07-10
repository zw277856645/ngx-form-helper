export interface ErrorHandlerTooltipConfig {

    // 如何查找tooltip的选择器
    selector?: string;

    // 如何查找tooltip中远程验证项的选择器
    // pending状态的验证项有特殊的样式
    pendingSelector?: string;

    // 查找tooltip的上下文代理，会在指定的代理对象子节点中寻找。语法同form-helper -> data-scroll-proxy
    // 默认为当前表单域/表单组的父元素
    contextProxy?: string;

    // 主题样式
    className?: string | false;

    // pending状态自动添加的类名，加在tooltip上
    // 相应的验证项需指定pendingSelector设置的类名或属性名
    pendingClassName?: string;

    // invalid状态自动添加的类名，加在tooltip上
    // 相应的验证项需使用[class.error]指明错误时的类名(必须是error)
    invalidClassName?: string;

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

    // tooltip z-index
    zIndex?: number;
}