import { Observable } from 'rxjs/Observable';
export type Selector = string | JQuery | HTMLElement;

/**
 * 表单域：指绑定了ngModel的元素
 */
export interface FormHelperConfig {

    // 成功提交后是否自动重置表单
    resetAfterSubmitted?: boolean;

    // 表单所处上下文，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误。
    context?: Window | Selector;

    // 错误定位使用，错误项距离浏览器顶部偏移量
    // 默认为form.offset().top
    offsetTop?: number;

    // 错误定位使用，是否自动滚动到第一个错误项
    autoScrollToTopError?: boolean;

    // 设置表单域的辅助滚动对象，在其上加上类名即可(非必须)。
    // 设置后滚动条定位错误时，会优先定位其辅助滚动对象。且辅助滚动对象会在表单域验证失败时加上errorClassName
    //
    // 可选设置：当前表单域(优先)及其所在组(ngModelGroup，不包括ngForm)的前一个元素/后一个元素/任意祖先元素(不包括form)
    //
    // PS：当表单域前/后都有辅助滚动对象时，优先使用前面的辅助滚动对象
    scrollTargetClassName?: string;

    // 表单域主题
    className?: string | false;

    // 验证失败时表单域自动添加的类名。辅助滚动对象也会同时增加(若有)
    errorClassName?: string | false;

    // 错误提示处理组件
    // string类型时表示处理组件的名称
    // object类型时，name表示处理组件的名称，config表示配置参数；不同的组件各不相同
    errorHandler?: string | false | { name: string; config?: { [key: string]: any; } };

    // 表单验证通过后，提交请求到请求结束之间状态的处理
    // string类型时表示处理组件的名称
    // object类型时，name表示处理组件的名称，config表示配置参数；不同的组件各不相同
    submitHandler?: string | false | { name: string; config?: { [key: string]: any; } };

    // 验证通过后的回调
    onSuccess?: () => Promise<any> | Observable<any> | void;

    // 验证不通过后的回调
    onDeny?: () => void;

    // 前提：开启了submitHandler
    // submitHandler处理完成后的回调
    onComplete?: () => void;
}


