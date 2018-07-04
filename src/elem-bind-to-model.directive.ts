import { Directive, ElementRef } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ELEMENT_BIND_TO_CONTROL_KEY } from './form-helper-utils';

@Directive({
    selector: '[ngModel]'
})
export class ElementBindToNgModelDirective {

    constructor(private el: ElementRef,
                private ngModel: NgModel) {
        Object.defineProperty(ngModel.control, ELEMENT_BIND_TO_CONTROL_KEY, {
            value: el.nativeElement,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }
}

