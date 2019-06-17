import { ErrorHandlerConfig } from '../error-handler-config';

export interface ErrorHandlerTooltipConfig extends ErrorHandlerConfig {

    // 错误消息定位代理
    // 默认相对于表单域/表单组本身定位，可使用任意其他元素作为代理
    // 语法：参见FormHelperConfig的scrollProxy
    positionProxy?: string;

}