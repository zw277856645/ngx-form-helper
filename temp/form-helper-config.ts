///**
// * fh-scroll-parent:
// *   当表单域不可见时，设置其辅助滚动的位置，必须为祖先元素或前一个元素或后一个元素
// */
//export class FormHelperConfig {
//
//    // 成功提交后是否自动重置表单
//    autoReset?: boolean = false;
//
//    // 错误定位使用，错误项距离浏览器顶部偏移量
//    offset?: number = 0;
//
//    // 错误定位使用，出现滚动的目标对象
//    // 通常都是window对象，但是当表单在弹层中时，有可能window的overflow被隐藏，滚动的是遮罩背景，此时需要设置此配置为有滚动条的对象
//    // 可能的值：selector，dom，jQuery，window
//    scrollTarget?: any | Window = window;
//
//    // 错误定位使用，是否自动滚动到第一个错误项。默认开启
//    scrollable?: boolean = true;
//
//    // 主题
//    theme?: string = 'theme-form-default';
//
//    // 错误提示处理组件
//    // string类型时表示处理组件的名称
//    // object类型时，plugin表示处理组件的名称，其余字段表示配置参数；不同的组件各不相同
//    errorHandler?: string | { plugin: string; [key: string]: any; } | false = 'tooltip';
//
//    // 表单验证通过后，提交请求到请求结束之间状态的处理
//    // 默认使用loading图标
//    submitHandler?: string | false = 'default';
//}
