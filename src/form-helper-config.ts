/**
 * formHelper 配置
 */
export interface FormHelperConfig {

    /**
     * [参见]{@link FormHelperDirective#context}
     */
    context?: Window | HTMLElement | string;

    /**
     * [参见]{@link FormHelperDirective#scrollProxy}
     */
    scrollProxy?: string;

    /**
     * [参见]{@link FormHelperDirective#autoScroll}
     */
    autoScroll?: boolean;

    /**
     * [参见]{@link FormHelperDirective#offsetTop}
     */
    offsetTop?: number;

    /**
     * [参见]{@link FormHelperDirective#validateImmediate}
     */
    validateImmediate?: boolean;

    /**
     * [参见]{@link FormHelperDirective#validateImmediateDescendants}
     */
    validateImmediateDescendants?: boolean;

    /**
     * [参见]{@link FormHelperDirective#isolation}
     */
    isolation?: boolean;

    /**
     * [参见]{@link FormHelperDirective#classNames}
     */
    classNames?: string;

    /**
     * [参见]{@link FormHelperDirective#errorClassNames}
     */
    errorClassNames?: string;

    /**
     * [参见]{@link FormHelperDirective#errorGroupClassNames}
     */
    errorGroupClassNames?: string;

}