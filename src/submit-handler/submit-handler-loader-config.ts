export enum IconToggleStrategy {
    APPEND = 'APPEND', REPLACE = 'REPLACE'
}

export interface SubmitHandlerLoaderConfig {

    // 主题样式
    classNames?: string;

    // loader主题样式
    iconClassNames?: string;

    // 寻找图标的选择器，若找到，则用iconClassNames替换找到的图标类名，否则在整个按钮区域使用classNames
    iconSelector?: string;

    // iconClassName替换策略
    // append: 在原有类名基础上增加
    // replace: 完全使用新类名替换原类名
    iconToggleStrategy?: IconToggleStrategy;

    // 禁用主题样式
    disableTheme?: boolean;

    // loader最小动画时长(ms)
    minDuration?: number;
}