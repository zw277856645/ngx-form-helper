import { Directive, ElementRef } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { ELEMENT_BIND_TO_CONTROL_KEY } from './form-helper-utils';
import { interval } from 'rxjs';
import { first, skipWhile } from 'rxjs/operators';

@Directive({
    selector: '[ngModelGroup]'
})
export class ElementBindToNgModelGroupDirective {

    constructor(private el: ElementRef,
                private ngModelGroup: NgModelGroup) {
        interval(100).pipe(
            skipWhile(() => !ngModelGroup.control),
            first()
        ).subscribe(() => {
            Object.defineProperty(ngModelGroup.control, ELEMENT_BIND_TO_CONTROL_KEY, {
                value: el.nativeElement,
                configurable: false,
                enumerable: false,
                writable: false
            });
        });
    }

}
