export enum TooltipPosition {

    TOP_LEFT = 'top left', TOP_CENTER = 'top center', TOP_RIGHT = 'top right',

    BOTTOM_LEFT = 'bottom left', BOTTOM_CENTER = 'bottom center', BOTTOM_RIGHT = 'bottom right',

    RIGHT_CENTER = 'right center', LEFT_CENTER = 'left center'
}

export class ErrorHandlerTooltipConfig {

    // 主题样式
    classNames?: string | false;

    // x轴偏移
    offsetX?: number;

    // y轴偏移
    offsetY?: number;

    // 字体大小
    fontSize?: number;

    // 提示相对表单域/表单组的位置
    position?: TooltipPosition;

    /**
     * 错误消息定位代理
     *
     * 默认相对于表单域本身定位，可使用任意其他元素作为代理。代理元素必须包含在错误消息直接父元素下
     *
     * 语法：参见FormHelperConfig的scrollProxy
     *
     * PS：参照物为关联的表单域，而不是错误消息自身
     */
    positionProxy?: string;

    // 显示/隐藏动画时长(ms)
    duration?: number;

    // tooltip z-index
    zIndex?: number;
}