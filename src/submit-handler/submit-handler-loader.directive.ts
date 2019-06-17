import {
    AfterViewInit,
    Directive, ElementRef, HostListener, Inject, InjectionToken, Input, OnChanges, Optional, Renderer2, SimpleChanges,
    SkipSelf
} from '@angular/core';
import { IconToggleStrategy, SubmitHandlerLoaderConfig } from './submit-handler-loader-config';
import { SubmitHandler } from './submit-handler';
import { interval } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { FormHelperDirective } from '../form-helper.directive';
import { isNotFirstChange, splitClassNames } from '../utils';

export const SUBMIT_HANDLER_LOADER_CONFIG = new InjectionToken<SubmitHandlerLoaderConfig>('submit_handler_loader_config');

@Directive({
    selector: '[shLoader]',
    exportAs: 'shLoader'
})
export class SubmitHandlerLoaderDirective implements SubmitHandler, OnChanges, AfterViewInit {

    @Input() classNames: string = 'sh-loader-theme';

    @Input() iconClassNames: string = 'sh-loader-theme-icon';

    @Input() iconSelector: string | false = 'i.icon, i.fa';

    @Input() iconToggleStrategy: IconToggleStrategy = IconToggleStrategy.APPEND;

    @Input() duration: number = 400;

    @Input() disableTheme: boolean;

    // 当submit元素在form外部时有用，使用此属性关联formHelper实例
    @Input() refForm: FormHelperDirective;

    @HostListener('click') onClick() {
        let finalForm = this.formHelper || this.refForm;
        if (finalForm) {
            finalForm.submit(this);
        }
    }

    private ele: HTMLElement;
    private loading: HTMLElement;
    private originIconClasses: string;
    private startTime: number;

    constructor(private eleRef: ElementRef,
                private renderer: Renderer2,
                @Optional() @SkipSelf() private formHelper: FormHelperDirective,
                @Optional() @Inject(SUBMIT_HANDLER_LOADER_CONFIG) private overrideConfig: SubmitHandlerLoaderConfig) {
        Object.assign(this, overrideConfig);
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

    end() {
        let diff = new Date().getTime() - this.startTime;
        let duration = diff < +this.duration ? +this.duration - diff : 0;

        return interval(duration).pipe(
            first(),
            map(() => {
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
            })
        );
    }

    private addClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.addClass(ele, cls));
    }

    private removeClasses(ele: Element, classNames: string) {
        splitClassNames(classNames).forEach(cls => this.renderer.removeClass(ele, cls));
    }

}