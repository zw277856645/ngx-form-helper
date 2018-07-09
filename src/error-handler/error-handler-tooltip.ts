import { ErrorHandler } from './error-handler';
import { ErrorHandlerTooltipConfig } from './error-handler-tooltip-config';
import { findProxyItem, getContextProxy, getOffsetX, getOffsetY, getPosition } from '../form-helper-utils';
import { isUndefined } from 'util';
const $ = require('jquery');

/**
 * data-* api
 *  1)context-proxy：覆盖config中配置。使用方表单域/表单组
 *  2)offset-y：提示垂直偏移量，负数向上，正数向下。使用方tooltip
 *  3)offset-x：提示水平偏移量，负数向左，正数向右。使用方tooltip
 *  4)position：覆盖config中配置。使用方tooltip
 */
export class ErrorHandlerTooltip implements ErrorHandler {

    private config: ErrorHandlerTooltipConfig;
    private isInitial: boolean;
    private lastStatusValid: boolean;
    private $tooltip: JQuery;
    private offsetY = 0;
    private offsetX = 0;

    constructor(private $ele: JQuery,
                config: ErrorHandlerTooltipConfig) {
        this.config = {
            selector: '.fh-tooltip, [fh-tooltip]',
            contextProxy: '^',
            className: 'fh-tooltip-theme-default',
            position: 'bottom right',
            animationIn: 'animated fadeIn',
            animationOut: 'animated fadeOut',
            duration: 200
        };
        $.extend(this.config, config);
    }

    whenValid() {
        this.init();
        if (this.lastStatusValid === true || isUndefined(this.lastStatusValid)) {
            return;
        }
        if (this.$tooltip && this.$tooltip.length) {
            this.lastStatusValid = true;
            this.$tooltip
                .addClass('visible')
                .removeClass(this.config.animationIn)
                .addClass(this.config.animationOut);
            setTimeout(() => {
                this.$tooltip.removeClass('visible').removeClass(this.config.animationOut);
            }, this.config.duration);
        }
    }

    whenInvalid() {
        this.init();
        if (this.lastStatusValid === false) {
            return;
        }
        if (this.$tooltip && this.$tooltip.length) {
            this.lastStatusValid = false;
            this.$tooltip
                .addClass('visible')
                .removeClass(this.config.animationOut)
                .addClass(this.config.animationIn);
            setTimeout(() => this.$tooltip.removeClass(this.config.animationIn), this.config.duration);
        }
    }

    private init() {
        if (!this.isInitial) {
            this.isInitial = true;
            if (this.config.contextProxy) {
                let contextProxy = getContextProxy(this.$ele) || this.config.contextProxy;
                let $proxy = findProxyItem(this.$ele, contextProxy);
                if ($proxy && $proxy.length) {
                    this.$tooltip = contextProxy.includes('^') ? $proxy.find(this.config.selector).eq(0) : $proxy;
                    if (this.$tooltip.length) {
                        // 使tooltip定位相对于父元素
                        this.$tooltip.parent().css('position', 'relative');

                        if (this.config.className) {
                            this.$tooltip.addClass(this.config.className);
                        }
                        if (this.config.duration !== false) {
                            this.$tooltip.css('animation-duration', this.config.duration + 'ms');
                        }

                        let param = getPosition(this.$tooltip);
                        if (param) {
                            this.config.position = param;
                        }
                        this.$tooltip.addClass(this.config.position);

                        param = getOffsetY(this.$tooltip);
                        if (param) {
                            this.offsetY = param;
                        }

                        param = getOffsetX(this.$tooltip);
                        if (param) {
                            this.offsetX = param;
                        }
                    }
                }
            }
        }
    }
}