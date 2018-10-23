import { ErrorHandler } from './error-handler';
import { ErrorHandlerTextConfig } from './error-handler-text-config';
import { findProxyItem, getContextProxy, getInline, getOffsetX, getOffsetY } from '../form-helper-utils';
import { isNullOrUndefined, isUndefined } from 'util';
const $ = require('jquery');

/**
 * data-* api
 *  1)context-proxy：覆盖config中配置，与config中不同的是值可为false。使用方表单域/表单组
 *  2)offset-y：提示垂直偏移量，负数向上，正数向下。使用方错误文本
 *  3)offset-x：提示水平偏移量，负数向左，正数向右。使用方错误文本
 *  4)inline：覆盖config中配置。使用方错误文本
 */
export class ErrorHandlerText implements ErrorHandler {

    private config: ErrorHandlerTextConfig;
    private $text: JQuery;
    private isInitial: boolean;
    private lastStatusValid: boolean;

    constructor(private $ele: JQuery,
                config: ErrorHandlerTextConfig) {
        this.config = {
            selector: '.fh-message, [fh-message]',
            contextProxy: '^',
            className: 'fh-text-theme-default',
            inline: true,
            align: 'left',
            fontSize: 13
        };
        $.extend(this.config, config);
    }

    whenValid() {
        this.init();
        if (this.lastStatusValid === true || isUndefined(this.lastStatusValid)) {
            return;
        }
        if (this.$text && this.$text.length) {
            this.lastStatusValid = true;
            this.$text.removeClass('visible');
        }
    }

    whenInvalid() {
        this.init();
        if (this.lastStatusValid === false) {
            return;
        }
        if (this.$text && this.$text.length) {
            this.lastStatusValid = false;
            this.$text.addClass('visible');
        }
    }

    private init() {
        if (!this.isInitial) {
            this.isInitial = true;
            if (this.config.contextProxy) {
                let contextProxy = getContextProxy(this.$ele);

                // 表单域/表单组可配置data-context-proxy=false，代表忽略错误文本
                if (contextProxy === false) {
                    return;
                } else if (!contextProxy) {
                    contextProxy = this.config.contextProxy;
                }

                let $proxy = findProxyItem(this.$ele, <string> contextProxy);
                if ($proxy && $proxy.length) {
                    this.$text = $proxy.is(this.config.selector) ? $proxy : $proxy.find(this.config.selector).eq(0);
                    if (this.$text && this.$text.length) {
                        // 初始化固定样式
                        if (this.config.className) {
                            this.$text.addClass(this.config.className);
                        }
                        if (!isNullOrUndefined(this.config.fontSize)) {
                            this.$text.css('font-size', this.config.fontSize);
                        }

                        /* 参数解析 */

                        let param = getInline(this.$text);
                        if (!isNullOrUndefined(param)) {
                            this.config.inline = !!param;
                        }
                        if (!this.config.inline) {
                            this.$text.addClass('block').addClass(this.config.align);
                        }

                        param = getOffsetY(this.$text);
                        if (param) {
                            this.$text.css('top', param);
                        }

                        param = getOffsetX(this.$text);
                        if (param) {
                            this.$text.css('left', param);
                        }
                    }
                }
            }
        }
    }
}
