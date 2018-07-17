import { Observable } from 'rxjs/Observable';

export type Selector = string | JQuery | HTMLElement;

/**
 * 表单域：指绑定了ngModel的元素
 * 表单组：指绑定了ngModelGroup的元素
 */
export interface FormHelperConfig {

    // 成功提交后是否自动重置表单
    autoReset?: boolean;

    // 默认只在控件dirty状态触发，设置为true可立即触发验证
    // 可被表单域/表单组的data api配置覆盖
    validateImmediate?: boolean;

    // 表单所处上下文，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误
    // 点号表达式：. -> 当前form，.. -> 父元素，../../ etc
    context?: Window | Selector;

    // 额外的提交按钮选择器。默认查找当前form下的type=submit的按钮
    // 若触发提交的按钮在form外部，可设置此参数指定
    extraSubmits?: Selector;

    // 错误定位使用，错误项距离浏览器顶部偏移量，负数向上，正数向下
    offsetTop?: number;

    // 错误定位使用，是否自动滚动到第一个错误项
    // PS：当表单域不可见时，自动寻找包含该元素的表单组，不可见继续寻找直到ngForm(不包含)，以此元素为定位对象
    //     若通过data api设置了滚动代理，则以滚动代理为优先定位对象
    autoScroll?: boolean;

    // 表单域主题
    className?: string | false;

    // 验证失败时表单域自动添加的类名
    errorClassName?: string | false;

    // 验证失败时表单组自动添加的类名
    errorGroupClassName?: string | false;

    // 错误提示处理组件
    // string类型时表示处理组件的名称
    // object类型时，name表示处理组件的名称，config表示配置参数；不同的组件各不相同
    errorHandler?: string | false | { name: string; config?: { [key: string]: any; } };

    // 表单验证通过后，提交请求到请求结束之间状态的处理
    // string类型时表示处理组件的名称
    // object类型时，name表示处理组件的名称，config表示配置参数；不同的组件各不相同
    submitHandler?: string | false | { name: string; config?: { [key: string]: any; } };

    // 验证通过后的回调
    onSuccess?: () => Promise<any> | Observable<any> | any;

    // 验证不通过后的回调
    onDeny?: () => void;

    // 前提：开启了submitHandler
    // submitHandler处理完成后的回调。参数为onSuccess返回值
    onComplete?: (...args: any[]) => void;
}


