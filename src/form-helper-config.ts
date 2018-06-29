export type Selector = string | JQuery | HTMLElement;

/**
 * 表单域：指绑定了ngModel的元素
 */
export class FormHelperConfig {

    // 成功提交后是否自动重置表单
    resetAfterSubmitted?: boolean = true;

    // 表单所处位置，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误。
    scrollTarget?: Window | Selector = window;

    // 错误定位使用，错误项距离浏览器顶部偏移量
    // 默认为form.offset().top
    offsetTop?: number;

    // 错误定位使用，是否自动滚动到第一个错误项
    autoScrollToTopError?: boolean = true;

    // 当表单域不可见时，设置其辅助滚动的对象(必须可见)，在其上加上类名即可
    // 必须为：表单域的任意祖先元素、表单域的前一个元素、表单域的后一个元素
    assistScrollTargetClass?: string = 'fh-scroll-target';

    // 表单域主题前缀
    themePrefix?: string = 'fh-theme-';

    // 表单域主题
    theme?: string | false = 'default';

    // 错误提示处理组件
    // string类型时表示处理组件的名称
    // object类型时，name表示处理组件的名称，config表示配置参数；不同的组件各不相同
    errorHandler?: string | false | { name: string; config: { [key: string]: any; } } = 'tooltip';

    // 表单验证通过后，提交请求到请求结束之间状态的处理
    // 默认使用loader
    submitHandler?: string | false = 'loader';

    // 验证通过后的回调
    onSuccess?: Function;

    // 验证不通过后的回调
    onDeny?: Function;

    // 前提：开启了submitHandler
    // submitHandler处理完成后的回调
    onComplete?: Function;
}


