import {
    AfterViewInit, Component, ElementRef, HostBinding, Inject, InjectionToken, Input, NgZone, OnInit,
    Optional, Provider, Renderer2, SkipSelf
} from '@angular/core';
import { ErrorMessageHandler } from '../error-message-handler';
import { ErrorHandlerTooltipMessageConfig, TooltipPosition } from './error-handler-tooltip-message-config';
import { FormHelperDirective } from '../../form-helper.directive';
import { ErrorMessage } from '../error-message';
import { arrayProviderFactory, getProxyElement, loadMessagesFromDataset } from '../../utils';
import { ErrorHandlerTooltipDirective } from './error-handler-tooltip.directive';
import { getOuterHeight, getOuterWidth, getStyle, isHidden } from 'cmjs-lib';

export const ERROR_HANDLER_TOOLTIP_MSG_CONFIG
    = new InjectionToken<ErrorHandlerTooltipMessageConfig>('error_handler_tooltip_msg_config');

export const ERROR_HANDLER_TOOLTIP_MSG_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTooltipMessageConfig[]>('error_handler_tooltip_msg_config_array');

export function errorHandlerTooltipMsgConfigProvider(config: ErrorHandlerTooltipMessageConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TOOLTIP_MSG_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TOOLTIP_MSG_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TOOLTIP_MSG_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TOOLTIP_MSG_CONFIG_ARRAY ]
            ]
        }
    ];
}

@Component({
    selector: 'eh-tooltip-message',
    templateUrl: './error-handler-tooltip-message.component.html',
    styleUrls: [ './error-handler-tooltip-message.component.less' ]
})
export class ErrorHandlerTooltipMessageComponent extends ErrorMessageHandler implements AfterViewInit, OnInit {

    @Input() classNames: string | false = 'eh-tooltip-theme';

    @Input() offsetX: number = 0;

    @Input() offsetY: number = 0;

    @Input() position: TooltipPosition = TooltipPosition.BOTTOM_RIGHT;

    @HostBinding('style.font-size.px') @Input() fontSize: number = 13;

    @HostBinding('style.z-index') @Input() zIndex: number = 1;

    @HostBinding('style.transition-duration.ms') duration: number = 200;

    // 消息显示/隐藏
    @HostBinding('class.visible') visible: boolean;

    // 消息状态
    @HostBinding('class.valid') valid: boolean;
    @HostBinding('class.invalid') invalid: boolean;
    @HostBinding('class.pending') pending: boolean;

    messages: ErrorMessage[] = [];

    private proxyEle: HTMLElement;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                private zone: NgZone,
                @SkipSelf() private fhCtrl: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TOOLTIP_MSG_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTooltipMessageConfig[]) {
        super(eleRef, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngOnInit() {
        super.addClasses(this.element, this.classNames);
        this.messages = loadMessagesFromDataset(this.element as HTMLElement);

        // 从HTML加载是否是异步验证
        for (let k in (this.element as HTMLElement).dataset) {
            let [ name, order, type ] = k.split('.');
            let message = this.messages.find(m => m.validator === name);

            if (/^async$/i.test(type || order)) {
                message.async = true;
            } else if (/^sync$/i.test(type || order)) {
                message.async = false;
            }
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        if (getStyle(this.element.parentElement, 'position') === 'static') {
            this.renderer.setStyle(this.element.parentElement, 'position', 'relative');
        }

        super.addClasses(this.element, this.position);
    }

    onBindErrorHandler() {
        if (this.errorHandler instanceof ErrorHandlerTooltipDirective && this.errorHandler.asyncValidators) {
            for (let msg of this.messages) {
                // 若HTML已指定了async，忽略系统自动分析
                if (msg.async === null || msg.async === undefined) {
                    // 从 asyncValidators 中匹配名称开头与消息名称相同则为异步验证器
                    // 此方式需要验证器指令返回的错误名称与指令名称开头一致，如：NameUniqueValidator -> {nameUnique:true}
                    if (
                        this.errorHandler.asyncValidators.find((valid: any) => {
                            return !!((valid.constructor && (valid.constructor.name as string)) || '')
                                .match(new RegExp(`^${msg.validator}`, 'i'));
                        })
                    ) {
                        msg.async = true;
                    }
                }
            }
        }
    }

    whenValid() {
        this.visible = false;
        this.hostStatusChange();
    }

    whenInvalid() {
        this.visible = true;
        this.hostStatusChange();
        this.reposition();
    }

    whenPending() {
        this.hostStatusChange();
    }

    reposition() {
        this.zone.runOutsideAngular(() => {
            let parent = this.element.parentElement;

            if (isHidden(parent) || !this.errorHandler) {
                return;
            }

            if (!this.proxyEle) {
                let positionProxy = (this.errorHandler instanceof ErrorHandlerTooltipDirective)
                    ? this.errorHandler.positionProxy : null;
                let proxy = positionProxy ? getProxyElement(this.errorHandler.element, positionProxy) : null;
                this.proxyEle = (proxy || this.errorHandler.element) as HTMLElement;
            }

            // proxyEle必须包含在消息的parent之中
            if (!parent.contains(this.proxyEle) || parent === this.proxyEle) {
                throw new Error(this.controlName + '：表单域(ngModel)或表单组(ngModelGroup)或定位代理(positionProxy)必须在'
                    + '与之关联的 eh-tooltip-message 的直接父元素下');
            }

            let parentWidth = getOuterWidth(parent),
                parentHeight = getOuterHeight(parent),

                proxyWidth = getOuterWidth(this.proxyEle),
                proxyHeight = getOuterHeight(this.proxyEle),

                selfWidth = getOuterWidth(this.element),
                selfHeight = getOuterHeight(this.element);

            // proxy到parent之间可能有多个定位父元素，需要计算出proxy到parent的offset累加值
            let tmp = this.proxyEle,
                offsetTop = 0,
                offsetLeft = 0;

            do {
                offsetTop += tmp.offsetTop;
                offsetLeft += tmp.offsetLeft;
                tmp = tmp.offsetParent as HTMLElement;
            } while (tmp !== parent && parent.contains(tmp));

            switch (this.position) {
                default:
                case TooltipPosition.BOTTOM_RIGHT:
                    this.setStyle('top', offsetTop + proxyHeight + +this.offsetY + 'px');
                    this.setStyle('right', parentWidth - offsetLeft - proxyWidth + +this.offsetX + 'px');
                    break;
                case TooltipPosition.BOTTOM_CENTER:
                    this.setStyle('top', offsetTop + proxyHeight + +this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + (proxyWidth / 2) - (selfWidth / 2) + +this.offsetX + 'px');
                    break;
                case TooltipPosition.BOTTOM_LEFT:
                    this.setStyle('top', offsetTop + proxyHeight + +this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + +this.offsetX + 'px');
                    break;
                case TooltipPosition.TOP_RIGHT:
                    this.setStyle('right', parentWidth - offsetLeft - proxyWidth + +this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + +this.offsetY + 'px');
                    break;
                case TooltipPosition.TOP_CENTER:
                    this.setStyle('left', offsetLeft + (proxyWidth / 2) - (selfWidth / 2) + +this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + +this.offsetY + 'px');
                    break;
                case TooltipPosition.TOP_LEFT:
                    this.setStyle('left', offsetLeft + +this.offsetX + 'px');
                    this.setStyle('bottom', parentHeight - offsetTop + +this.offsetY + 'px');
                    break;
                case TooltipPosition.LEFT_CENTER:
                    this.setStyle('top', offsetTop + (proxyHeight / 2) - (selfHeight / 2) + +this.offsetY + 'px');
                    this.setStyle('right', parentWidth - offsetLeft + +this.offsetX + 'px');
                    break;
                case TooltipPosition.RIGHT_CENTER:
                    this.setStyle('top', offsetTop + (proxyHeight / 2) - (selfHeight / 2) + +this.offsetY + 'px');
                    this.setStyle('left', offsetLeft + proxyWidth + +this.offsetX + 'px');
                    break;
            }
        });
    }

    trackByMessages(i: number, msg: ErrorMessage) {
        return msg.validator;
    }

    get formHelper() {
        return this.fhCtrl;
    }

    private setStyle(style: string, value: any) {
        this.renderer.setStyle(this.element, style, value);
    }

    private hostStatusChange() {
        if (this.control) {
            this.valid = this.control.valid;
            this.invalid = this.control.invalid;
            this.pending = this.control.pending;
        } else {
            this.valid = this.invalid = this.pending = false;
        }
    }

}