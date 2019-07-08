export interface FormHelperConfig {

    // 成功提交后是否自动重置表单
    autoReset?: boolean;

    // 表单域所处上下文，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误
    // 可用格式: 1.css选择器
    //          2.点号表达式，语法：. -> 当前form，.. -> 父元素，../../ etc
    //          3.window/dom/elementRef对象
    context?: Window | HTMLElement | string;

    // 表单域的滚动代理
    //
    // 默认滚动到错误项本身，但当错误项本身处于不可见状态时，使用另一个可见对象作为代理
    // 若没有设置滚动代理，且错误项本身不可见，会迭代寻找其父域(group)直到ngForm(不包含)，使用第一个可见对象作为代理
    //
    // 可被表单域自身的配置覆盖
    //
    // 语法：^ -> 父节点，~ -> 前一个兄弟节点，+ -> 后一个兄弟节点。可以任意组合
    // 示例：^^^，^2，~3^4+2
    scrollProxy?: string;

    // 错误定位使用，是否自动滚动到第一个错误项
    autoScroll?: boolean;

    // 错误定位使用，错误项距离浏览器顶部偏移量，负数向上，正数向下
    offsetTop?: number;

    // 默认只在控件dirty状态触发，设置为true可立即触发验证
    // 可被表单域自身的配置覆盖
    validateImmediate?: boolean;

    // 当表单域为formGroup或formArray时，是否同时立即验证其所有子孙控件。默认为true
    // 可被表单域自身的配置覆盖
    validateImmediateDescendants?: boolean;

    // 表单域主题
    classNames?: string | false;

    // 验证失败时表单域自动添加的类名
    // 同表单域自身配置累加
    errorClassNames?: string | false;

    // 验证失败时表单域(组)自动添加的类名
    // 同表单域(组)自身配置累加
    errorGroupClassNames?: string | false;

    // 判断响应是否成功的断言函数，res为返回值
    // 请求状态码不为200时，已被自动处理。若用户自定义了错误码，需要使用此配置指定判断逻辑
    // 如果断言函数返回false，则后续不会执行reset操作
    resultOkAssertion?: (res: any) => boolean;

}