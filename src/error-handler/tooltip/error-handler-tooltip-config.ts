export enum TooltipPosition {

    TOP_LEFT = 'top left', TOP_CENTER = 'top center', TOP_RIGHT = 'top right',

    BOTTOM_LEFT = 'bottom left', BOTTOM_CENTER = 'bottom center', BOTTOM_RIGHT = 'bottom right',

    RIGHT_CENTER = 'right center', LEFT_CENTER = 'left center'
}

/**
 * eh-tooltip 配置
 */
export class ErrorHandlerTooltipConfig {

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#classNames}
     */
    classNames?: string;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#offsetX}
     */
    offsetX?: number;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#offsetY}
     */
    offsetY?: number;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#fontSize}
     */
    fontSize?: number;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#position}
     */
    position?: TooltipPosition;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#positionProxy}
     */
    positionProxy?: string;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#duration}
     */
    duration?: number;

    /**
     * [参见]{@link ErrorHandlerTooltipComponent#zIndex}
     */
    zIndex?: number;
}