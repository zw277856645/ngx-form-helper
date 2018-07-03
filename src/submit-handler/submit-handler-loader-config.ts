export interface SubmitHandlerLoaderConfig {

    className?: string;

    iconClassName?: string;

    // iconClassName替换策略
    // append: 在原有类名基础上增加
    // replace: 完全使用新类名替换原类名
    iconToggleStrategy?: 'append' | 'replace';

    // 寻找图标的jquery选择器，若找到，则用iconClassName替换找到的图标类名，否则在整个按钮区域使用className
    iconSelector?: string | false;

    // loader动画时长(ms)
    duration?: number;
}