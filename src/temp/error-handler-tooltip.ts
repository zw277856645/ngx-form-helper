import { ErrorHandler } from './error-handler';
import { isNullOrUndefined } from 'util';

/**
 * fh-tooltip-parent:
 *   如果表单域没有设置tooltip提示，需要在其任意祖先元素加上fh-tooltip-parent类名，否则系统会自动寻找直到form元素
 */
export class ErrorHandlerTooltip implements ErrorHandler {

    private readonly POSITION_CLASSES = 'top left center bottom right';

    private fieldName: string;
    private $form: JQuery;
    private config: any;
    private $field: JQuery;
    private $parent: JQuery;
    private $tooltip: JQuery;
    private timeoutHandler: any;

    // 配置
    private position: string;
    private offsetX: number;
    private offsetY: number;
    private target: string;
    private animation: string;
    private theme: string;

    constructor(fieldName: string, $form: JQuery, config: any) {
        this.fieldName = fieldName;
        this.$form = $form;
        this.config = config;
    }

    private findTooltip() {
        // 当表单name含有模板表达式'{{}}'时，不会生成name属性，只有ng-reflect-name
        this.$field = this.$form.find(`[name="${this.fieldName}"],[ng-reflect-name="${this.fieldName}"]`).eq(0);
        this.$parent = this.$field;

        do {
            this.$parent = this.$parent.parent();
            this.$tooltip = this.$parent.find('.fh-tooltip').eq(0);
        } while (this.$tooltip.length == 0
        && this.$parent.length > 0
        && this.$parent[ 0 ].nodeName.toUpperCase() != 'FORM'
        && !this.$parent.hasClass('fh-tooltip-parent'));

        this.$parent.addClass('fh-tooltip-container');
    }

    private parseConfig() {
        // 提示位置
        this.position = this.$tooltip.data('position') || this.config.position || 'bottom right';

        // 提示水平偏移量，负数向左，正数向右
        this.offsetX = this.$tooltip.data('offsetX') || this.config.offsetX || 0;

        // 提示垂直偏移量，负数向上，正数向下
        this.offsetY = this.$tooltip.data('offsetY') || this.config.offsetY || 0;

        // 提示相对的元素，默认为绑定的表单域；依照此计算提示位置
        this.target = this.$tooltip.data('target') || this.config.target || null;

        // 动画
        this.animation = this.$tooltip.data('animation') || this.config.animation || 'scale';

        // 样式主题
        this.theme = this.$tooltip.data('theme') || this.config.theme || 'theme-tooltip-default';
    }

    private setPosition() {
        let ptWidth = this.$parent.outerWidth(),
            ptHeight = this.$parent.outerHeight(),

            $target = this.target ? this.$parent.find(this.target) : this.$field,
            tPosition = $target.position(),
            tWidth = $target.outerWidth(),
            tHeight = $target.outerHeight(),

            oHeight = this.$tooltip.outerHeight(),
            oWidth = this.$tooltip.outerWidth();

        switch (this.position) {
            default:
            case 'bottom right':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('bottom right')
                    .css({
                        top: tPosition.top + tHeight + this.offsetY + 'px',
                        right: ptWidth - tPosition.left - tWidth + this.offsetX + 'px',
                        bottom: 'auto',
                        left: 'auto'
                    });
                break;
            case 'bottom center':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('bottom center')
                    .css({
                        top: tPosition.top + tHeight + this.offsetY + 'px',
                        left: tPosition.left + (tWidth / 2) - (oWidth / 2) + this.offsetX + 'px',
                        bottom: 'auto',
                        right: 'auto'
                    });
                break;
            case 'bottom left':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('bottom left')
                    .css({
                        top: tPosition.top + tHeight + this.offsetY + 'px',
                        left: tPosition.left + this.offsetX + 'px',
                        bottom: 'auto',
                        right: 'auto'
                    });
                break;
            case 'top right':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('top right')
                    .css({
                        right: ptWidth - tPosition.left - tWidth + this.offsetX + 'px',
                        bottom: ptHeight - tPosition.top + this.offsetY + 'px',
                        top: 'auto',
                        left: 'auto'
                    });
                break;
            case 'top center':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('top center')
                    .css({
                        left: tPosition.left + (tWidth / 2) - (oWidth / 2) + this.offsetX + 'px',
                        bottom: ptHeight - tPosition.top + this.offsetY + 'px',
                        top: 'auto',
                        right: 'auto'
                    });
                break;
            case 'top left':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('top left')
                    .css({
                        left: tPosition.left + this.offsetX + 'px',
                        bottom: ptHeight - tPosition.top + this.offsetY + 'px',
                        top: 'auto',
                        right: 'auto'
                    });
                break;
            case 'left center':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('left center')
                    .css({
                        top: tPosition.top + (tHeight / 2) - (oHeight / 2) + this.offsetY + 'px',
                        right: ptWidth - tPosition.left + this.offsetX + 'px',
                        bottom: 'auto',
                        left: 'auto'
                    });
                break;
            case 'right center':
                this.$tooltip
                    .removeClass(this.POSITION_CLASSES)
                    .addClass('right center')
                    .css({
                        top: tPosition.top + (tHeight / 2) - (oHeight / 2) + this.offsetY + 'px',
                        left: tPosition.left + tWidth + this.offsetX + 'px',
                        bottom: 'auto',
                        right: 'auto'
                    });
                break;
        }
    }

    whenValid() {
        this.findTooltip();
        if (this.$tooltip.length) {
            this.$tooltip
                .addClass(this.theme)
                .addClass(this.animation)
                .removeClass('in')
                .addClass('out');

            this.timeoutHandler = setTimeout(() => {
                this.$tooltip.removeClass('visible');
                this.timeoutHandler = null;
            }, 500);
        }
    }

    whenInvalid() {
        this.findTooltip();
        if (this.$tooltip.length) {
            this.parseConfig();
            this.setPosition();

            if (!isNullOrUndefined(this.timeoutHandler)) {
                clearTimeout(this.timeoutHandler);
                this.timeoutHandler = null;
            }

            this.$tooltip
                .addClass(this.theme)
                .addClass(this.animation)
                .addClass('visible')
                .removeClass('out')
                .addClass('in');
        }
    }

    reposition() {
        if (this.$tooltip && this.$tooltip.length > 0 && this.$tooltip.is(':visible')) {
            this.setPosition();
        }
    }
}