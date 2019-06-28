export enum TooltipPosition {

    TOP_LEFT = 'top left', TOP_CENTER = 'top center', TOP_RIGHT = 'top right',

    BOTTOM_LEFT = 'bottom left', BOTTOM_CENTER = 'bottom center', BOTTOM_RIGHT = 'bottom right',

    RIGHT_CENTER = 'right center', LEFT_CENTER = 'left center'
}

export class ErrorHandlerTooltipMessageConfig {

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

    // 显示/隐藏动画时长(ms)
    duration?: number;

    // tooltip z-index
    zIndex?: number;
}