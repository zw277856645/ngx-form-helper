export enum IconToggleStrategy {
    APPEND = 'APPEND', REPLACE = 'REPLACE'
}

/**
 * shLoader 配置
 */
export interface SubmitHandlerLoaderConfig {

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#classNames}
     */
    classNames?: string;

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#iconClassNames}
     */
    iconClassNames?: string;

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#iconSelector}
     */
    iconSelector?: string;

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#iconToggleStrategy}
     */
    iconToggleStrategy?: IconToggleStrategy;

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#disableTheme}
     */
    disableTheme?: boolean;

    /**
     * [参见]{@link SubmitHandlerLoaderDirective#minDuration}
     */
    minDuration?: number;
}