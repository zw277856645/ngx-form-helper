import { ErrorHandler } from './error-handler';
import { ErrorHandlerTooltipConfig } from './error-handler-tooltip-config';
import { findProxyItem, getContextProxy, getOffsetX, getOffsetY, getPosition } from '../form-helper-utils';
import { isNullOrUndefined, isUndefined } from 'util';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
const $ = require('jquery');

/**
 * data-* api
 *  1)context-proxy：覆盖config中配置，与config中不同的是值可为false。使用方表单域/表单组
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
    private subscription: Subscription;
    private timeoutFlag: any;

    constructor(private $ele: JQuery,
                config: ErrorHandlerTooltipConfig,
                private control: AbstractControl) {
        this.config = {
            selector: '.fh-tooltip, [fh-tooltip]',
            contextProxy: '^',
            className: 'fh-tooltip-theme-default',
            pendingClassName: 'pending',
            invalidClassName: 'invalid',
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

            clearTimeout(this.timeoutFlag);
            this.timeoutFlag = setTimeout(() => {
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
            this.setLocation();

            this.$tooltip
                .addClass('visible')
                .removeClass(this.config.animationOut)
                .addClass(this.config.animationIn);

            clearTimeout(this.timeoutFlag);
            this.timeoutFlag = setTimeout(() => {
                this.$tooltip.removeClass(this.config.animationIn);
            }, this.config.duration);
        }
    }

    reposition() {
        this.setLocation();
    }

    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private init() {
        if (!this.isInitial) {
            this.isInitial = true;
            if (this.config.contextProxy) {
                let contextProxy = getContextProxy(this.$ele);

                // 表单域/表单组可配置data-context-proxy=false，代表忽略tooltip
                if (contextProxy === false) {
                    return;
                } else if (!contextProxy) {
                    contextProxy = this.config.contextProxy;
                }

                let $proxy = findProxyItem(this.$ele, <string>contextProxy);
                if ($proxy && $proxy.length) {
                    this.$tooltip = (<string>contextProxy).includes('^') ? $proxy.find(this.config.selector).eq(0)
                        : ($proxy.hasClass(this.config.selector) ? $proxy : null);
                    if (this.$tooltip && this.$tooltip.length) {
                        // 使tooltip定位相对于父元素
                        this.$tooltip.parent().css('position', 'relative');

                        // 初始化固定样式
                        if (this.config.className) {
                            this.$tooltip.addClass(this.config.className);
                        }
                        if (this.config.duration !== false) {
                            this.$tooltip.css('animation-duration', this.config.duration + 'ms');
                        }
                        if (!isNullOrUndefined(this.config.zIndex)) {
                            this.$tooltip.css('z-index', this.config.zIndex);
                        }

                        /* 参数解析 */

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

                        // 监听状态变化，绑定相应样式
                        this.subscription = this.control.statusChanges.subscribe(() => this.applyStyle());

                        // 立即触发一次
                        this.applyStyle();
                    }
                }
            }
        }
    }

    private applyStyle() {
        if (this.control.enabled && this.control.dirty) {
            this.$tooltip.removeClass(this.config.pendingClassName).removeClass(this.config.invalidClassName);
            if (this.control.pending) {
                this.$tooltip.addClass(this.config.pendingClassName);
            } else if (this.control.invalid) {
                this.$tooltip.addClass(this.config.invalidClassName);
            }
        }
    }

    private setLocation() {
        if (this.$tooltip && this.$tooltip.length) {
            let $parent = this.$tooltip.parent(),
                parentWidth = $parent.outerWidth(),
                parentHeight = $parent.outerHeight(),

                fieldWidth = this.$ele.outerWidth(),
                fieldHeight = this.$ele.outerHeight(),
                position = this.$ele.position(),

                width = this.$tooltip.outerWidth(),
                height = this.$tooltip.outerHeight();

            switch (this.config.position) {
                default:
                case 'bottom right':
                    this.$tooltip.css({
                        top: position.top + fieldHeight + this.offsetY + 'px',
                        right: parentWidth - position.left - fieldWidth + this.offsetX + 'px',
                    });
                    break;
                case 'bottom center':
                    this.$tooltip.css({
                        top: position.top + fieldHeight + this.offsetY + 'px',
                        left: position.left + (fieldWidth / 2) - (width / 2) + this.offsetX + 'px',
                    });
                    break;
                case 'bottom left':
                    this.$tooltip.css({
                        top: position.top + fieldHeight + this.offsetY + 'px',
                        left: position.left + this.offsetX + 'px',
                    });
                    break;
                case 'top right':
                    this.$tooltip.css({
                        right: parentWidth - position.left - fieldWidth + this.offsetX + 'px',
                        bottom: parentHeight - position.top + this.offsetY + 'px',
                    });
                    break;
                case 'top center':
                    this.$tooltip
                        .css({
                            left: position.left + (fieldWidth / 2) - (width / 2) + this.offsetX + 'px',
                            bottom: parentHeight - position.top + this.offsetY + 'px',
                        });
                    break;
                case 'top left':
                    this.$tooltip.css({
                        left: position.left + this.offsetX + 'px',
                        bottom: parentHeight - position.top + this.offsetY + 'px',
                    });
                    break;
                case 'left center':
                    this.$tooltip
                        .css({
                            top: position.top + (fieldHeight / 2) - (height / 2) + this.offsetY + 'px',
                            right: parentWidth - position.left + this.offsetX + 'px',
                        });
                    break;
                case 'right center':
                    this.$tooltip.css({
                        top: position.top + (fieldHeight / 2) - (height / 2) + this.offsetY + 'px',
                        left: position.left + fieldWidth + this.offsetX + 'px',
                    });
                    break;
            }
        }
    }
}