import {
    AfterViewInit, Component, ElementRef, HostBinding, Inject, InjectionToken, Input, NgZone, OnChanges, OnInit,
    Optional, Provider, Renderer2, SimpleChanges, SkipSelf
} from '@angular/core';
import { ErrorHandler } from '../error-handler';
import { ErrorHandlerTooltipConfig, TooltipPosition } from './error-handler-tooltip-config';
import { FormHelperDirective } from '../../form-helper.directive';
import { TooltipMessage, Message } from './tooltip-message';
import { arrayProviderFactory, getProxyElement } from '../../utils';
import { getOuterHeight, getOuterWidth, getStyle, isHidden } from 'cmjs-lib';

export const ERROR_HANDLER_TOOLTIP_CONFIG
    = new InjectionToken<ErrorHandlerTooltipConfig>('error_handler_tooltip_config');

export const ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY
    = new InjectionToken<ErrorHandlerTooltipConfig[]>('error_handler_tooltip_config_array');

export function errorHandlerTooltipConfigProvider(config: ErrorHandlerTooltipConfig): Provider[] {
    return [
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG,
            useValue: config
        },
        {
            provide: ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                ERROR_HANDLER_TOOLTIP_CONFIG,
                [ new SkipSelf(), new Optional(), ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY ]
            ]
        }
    ];
}

@Component({
    selector: 'eh-tooltip',
    templateUrl: './error-handler-tooltip.component.html',
    styleUrls: [ './error-handler-tooltip.component.less' ],
    providers: [
        {
            provide: ErrorHandler,
            useExisting: ErrorHandlerTooltipComponent
        }
    ],
    exportAs: 'ehTooltip'
})
export class ErrorHandlerTooltipComponent extends ErrorHandler implements AfterViewInit, OnInit, OnChanges {

    @Input() errorMessages: TooltipMessage[] | { [ error: string ]: Message | string };

    @Input() classNames: string | false = 'eh-tooltip-theme';

    @Input() offsetX: number = 0;

    @Input() offsetY: number = 0;

    @Input() position: TooltipPosition = TooltipPosition.BOTTOM_RIGHT;

    @Input() positionProxy: string;

    @HostBinding('style.font-size.px') @Input() fontSize: number = 13;

    @HostBinding('style.z-index') @Input() zIndex: number = 1;

    @HostBinding('style.transition-duration.ms') duration: number = 200;

    // 消息显示/隐藏
    @HostBinding('class.visible') visible: boolean;

    // 消息状态
    @HostBinding('class.valid') valid: boolean;
    @HostBinding('class.invalid') invalid: boolean;
    @HostBinding('class.pending') pending: boolean;

    messages: TooltipMessage[];

    private proxyEle: HTMLElement;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                private zone: NgZone,
                @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(ERROR_HANDLER_TOOLTIP_CONFIG_ARRAY)
                private overrideConfigs: ErrorHandlerTooltipConfig[]) {
        super(eleRef, formHelper, renderer);
        Object.assign(this, ...(overrideConfigs || []));
    }

    ngOnInit() {
        super.ngOnInit();

        this.addClasses(this.element, this.classNames);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errorMessages) {
            this.messages = ErrorHandlerTooltipComponent.convertErrorMessages2Array(this.errorMessages);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        if (getStyle(this.element.parentElement, 'position') === 'static') {
            this.renderer.setStyle(this.element.parentElement, 'position', 'relative');
        }

        this.addClasses(this.element, this.position);
    }

    whenValid() {
        this.visible = false;
        this.hostStatusChange();
    }

    whenInvalid() {
        this.visible = true;
        this.hostStatusChange();

        // setTimeout保证动态表单域创建完毕后执行
        setTimeout(() => this.reposition());
    }

    whenPending() {
        this.hostStatusChange();
    }

    reposition() {
        this.zone.runOutsideAngular(() => {
            let parent = this.element.parentElement;

            if (isHidden(parent)) {
                return;
            }

            if (!this.proxyEle) {
                let proxy = this.positionProxy ? getProxyElement(this.controlElement, this.positionProxy) : null;
                this.proxyEle = (proxy || this.controlElement) as HTMLElement;
            }

            // proxyEle必须包含在消息的parent之中
            if (!parent.contains(this.proxyEle) || parent === this.proxyEle) {
                throw new Error(this.controlName + '：表单域或其定位代理必须在'
                    + '与之关联的 eh-tooltip 的直接父元素下');
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

    trackByMessages(i: number, msg: TooltipMessage) {
        return msg.error;
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

    private static convertErrorMessages2Array(messages: TooltipMessage[] | { [ error: string ]: Message | string }) {
        let parsedMessages: TooltipMessage[] = [];

        if (Array.isArray(messages)) {
            parsedMessages = messages || parsedMessages;
        } else if (messages !== null && typeof messages === 'object') {
            for (let error in messages) {
                let message = messages[ error ];

                if (typeof message === 'string') {
                    parsedMessages.push({ error, message });
                } else if (message !== null && typeof message === 'object') {
                    parsedMessages.push({ error, ...message });
                } else {
                    parsedMessages.push({ error, message: '' });
                }
            }
        }

        return parsedMessages.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

}