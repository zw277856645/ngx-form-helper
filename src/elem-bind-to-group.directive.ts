import { Directive, ElementRef } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { ELEMENT_BIND_TO_CONTROL_KEY } from './form-helper-utils';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/first';

@Directive({
    selector: '[ngModelGroup]'
})
export class ElementBindToNgModelGroupDirective {

    constructor(private el: ElementRef,
                private ngModelGroup: NgModelGroup) {
        Observable
            .interval(100)
            .skipWhile(() => !ngModelGroup.control)
            .first()
            .subscribe(() => {
                Object.defineProperty(ngModelGroup.control, ELEMENT_BIND_TO_CONTROL_KEY, {
                    value: el.nativeElement,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            });
    }

}
