import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { SubmitHandlerDefault } from './submit-handler.default';

@Directive({
    selector: '[submitHandlerDefault]'
})
export class SubmitHandlerDefaultDirective extends SubmitHandlerDefault implements OnDestroy {

    @HostListener('click')
    click() {
        this.start();
        this.clicked.emit(this.end.bind(this));
    }

    @Output('submitHandlerDefault') clicked = new EventEmitter();

    constructor(private element: ElementRef) {
        super(element);
    }

    ngOnDestroy() {
        this.destroy();
    }
}
