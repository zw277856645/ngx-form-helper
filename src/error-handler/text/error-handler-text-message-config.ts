export interface ErrorHandlerTextMessageConfig {

    // 主题样式
    classNames?: string | false;

    // 错误文本是否与表单域/表单组在同一行
    inline?: boolean;

    // 字体大小
    fontSize?: number;

    // x轴偏移
    offsetX?: number;

    // y轴偏移
    offsetY?: number;

    // 是否浮动，浮动时采用绝对定位
    float?: boolean;

    // 是否右对齐
    right?: boolean;

    // 动画，内置选项有：fade、slideUp、slideDown、flyLeft、flyRight
    animation?: string;

}