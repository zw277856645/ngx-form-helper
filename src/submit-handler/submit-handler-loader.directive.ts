import {
    AfterViewInit, Directive, ElementRef, HostListener, Inject, InjectionToken, Input, OnChanges, Optional, Provider,
    Renderer2, SimpleChanges, SkipSelf
} from '@angular/core';
import { IconToggleStrategy, SubmitHandlerLoaderConfig } from './submit-handler-loader-config';
import { SubmitHandler } from './submit-handler';
import { FormHelperDirective } from '../form-helper.directive';
import { arrayProviderFactory, isNotFirstChange, splitClassNames } from '../utils';
import { InputBoolean, InputNumber } from '@demacia/cmjs-lib';

export const SUBMIT_HANDLER_LOADER_CONFIG =
    new InjectionToken<SubmitHandlerLoaderConfig>('submit_handler_loader_config');

export const SUBMIT_HANDLER_LOADER_CONFIG_ARRAY =
    new InjectionToken<SubmitHandlerLoaderConfig[]>('submit_handler_loader_config_array');

export function submitHandlerLoaderConfigProvider(config: SubmitHandlerLoaderConfig): Provider[] {
    return [
        {
            provide: SUBMIT_HANDLER_LOADER_CONFIG,
            useValue: config
        },
        {
            provide: SUBMIT_HANDLER_LOADER_CONFIG_ARRAY,
            useFactory: arrayProviderFactory,
            deps: [
                SUBMIT_HANDLER_LOADER_CONFIG,
                [ new SkipSelf(), new Optional(), SUBMIT_HANDLER_LOADER_CONFIG_ARRAY ]
            ]
        }
    ];
}

@Directive({
    selector: '[shLoader]',
    exportAs: 'shLoader'
})
export class SubmitHandlerLoaderDirective implements SubmitHandler, OnChanges, AfterViewInit {

    @Input() classNames: string = 'sh-loader-theme';

    @Input() iconClassNames: string = 'sh-loader-theme-icon';

    @Input() iconSelector: string = 'i.icon, i.fa';

    @Input() iconToggleStrategy: IconToggleStrategy = IconToggleStrategy.APPEND;

    @Input() @InputBoolean() disableTheme: boolean;

    @Input() @InputNumber() minDuration: number = 500;

    // 当submit元素在form外部时有用，使用此属性关联formHelper实例
    @Input() refForm: FormHelperDirective;

    @HostListener('click') onClick() {
        let finalForm = this.formHelper || this.refForm;
        if (finalForm) {
            finalForm.submit(this);
        }
    }

    private readonly ele: HTMLElement;
    private loading: HTMLElement;
    private originIconClasses: string;
    private startTime: number;
    private flag: any;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private formHelper: FormHelperDirective,
                // tslint:disable-next-line:prefer-inline-decorator
                @Optional() @Inject(SUBMIT_HANDLER_LOADER_CONFIG_ARRAY)
                private overrideConfigs: SubmitHandlerLoaderConfig[]) {
        Object.assign(this, ...(overrideConfigs || []));
        this.ele = eleRef.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (isNotFirstChange(changes.iconSelector) && changes.iconSelector.currentValue) {
            this.ngAfterViewInit();
        }
    }

    ngAfterViewInit() {
        if (typeof this.iconSelector === 'string') {
            this.loading = this.ele.querySelector(this.iconSelector);
        }
        if (this.loading) {
            this.originIconClasses = this.loading.className;
        }
    }

    start() {
        this.startTime = new Date().getTime();

        if (this.ele instanceof HTMLButtonElement) {
            this.ele.disabled = true;
        } else {
            this.renderer.addClass(this.ele, 'disabled');
        }

        if (this.disableTheme) {
            return;
        }

        if (this.loading) {
            if (this.iconToggleStrategy === IconToggleStrategy.REPLACE) {
                this.loading.className = '';
            }
            if (getComputedStyle(this.loading).position === 'static') {
                this.renderer.setStyle(this.loading, 'position', 'relative');
            }

            this.addClasses(this.loading, this.iconClassNames);
        } else {
            this.addClasses(this.ele, this.classNames);
        }
    }

    end(cb?: () => void) {
        clearTimeout(this.flag);

        let diff = new Date().getTime() - this.startTime;
        let duration = diff < this.minDuration ? this.minDuration - diff : 0;

        if (duration > 0) {
            this.flag = setTimeout(() => this.doEnd(cb), duration);
        } else {
            this.doEnd(cb);
        }
    }

    private doEnd(cb?: () => void) {
        if (this.ele instanceof HTMLButtonElement) {
            this.ele.disabled = false;
        } else {
            this.renderer.removeClass(this.ele, 'disabled');
        }

        if (this.disableTheme) {
            return;
        }

        if (this.loading) {
            this.removeClasses(this.loading, this.iconClassNames);

            if (this.iconToggleStrategy === IconToggleStrategy.REPLACE) {
                this.addClasses(this.loading, this.originIconClasses);
            }
        } else {
            this.removeClasses(this.ele, this.classNames);
        }

        if (typeof cb === 'function') {
            cb();
        }
    }

    private addClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.addClass(ele, cls));
    }

    private removeClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.removeClass(ele, cls));
    }

}