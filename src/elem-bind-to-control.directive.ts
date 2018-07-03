import { Directive, ElementRef } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[ngModel]',
})
export class ElementBindToControlDirective {

    static readonly key = '__element__';

    constructor(private el: ElementRef,
                private ngModel: NgModel) {
        Object.defineProperty(ngModel.control, ElementBindToControlDirective.key, {
            value: el.nativeElement,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }
}
