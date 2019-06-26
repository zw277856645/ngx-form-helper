import {
    AfterViewInit, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output
} from '@angular/core';
import { isNullOrUndefined } from 'util';

@Directive({
    selector: 'textarea[autoSize]'
})
export class TextareaAutoSizeDirective implements AfterViewInit {

    @Input() maxHeight: number;
    @Input() minHeight: number;

    @Output() sizeChange = new EventEmitter();

    @HostBinding('style.overflow-x') overflowX = 'hidden';
    @HostBinding('style.overflow-y') overflowY = 'hidden';
    @HostBinding('style.resize') resize = 'none';

    @HostListener('input') onInput() {
        this.textarea.style.height = 'auto';

        let dealtHeight = Math.max(this.textarea.scrollHeight, this.minHeight);
        if (!isNullOrUndefined(this.maxHeight)) {
            this.overflowY = dealtHeight > +this.maxHeight ? 'auto' : 'hidden';
            dealtHeight = Math.min(dealtHeight, +this.maxHeight);
        }

        this.textarea.style.height = dealtHeight + 'px';

        if (this.prevHeight !== dealtHeight) {
            this.prevHeight = dealtHeight;
            this.sizeChange.emit(dealtHeight);
        }
    }

    private textarea: HTMLTextAreaElement;
    private prevHeight: number;

    constructor(private ele: ElementRef) {
        this.textarea = ele.nativeElement;
    }

    ngAfterViewInit() {
        this.minHeight = Math.max(this.textarea.getBoundingClientRect().height, +(this.minHeight || 0));
        this.prevHeight = this.minHeight;

        if (!isNullOrUndefined(this.maxHeight) && this.minHeight >= +this.maxHeight) {
            this.maxHeight = null;
        }

        setTimeout(() => this.onInput());
    }

}