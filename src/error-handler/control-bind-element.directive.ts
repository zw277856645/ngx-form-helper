import { Directive, ElementRef, Host, Optional } from '@angular/core';
import { ControlContainer, NgControl } from '@angular/forms';
import { waitForControlInit } from '../utils';

@Directive({
    selector: `
        [ngModel],[ngModelGroup],
        [formControl],[formControlName],
        [formGroup],[formGroupName],
        [formArray],[formArrayName]
    `
})
export class ControlBindElementDirective {

    static readonly ELEMENT_BIND_KEY = '__ELEMENT_BIND_KEY__';

    constructor(private eleRef: ElementRef,
                @Optional() @Host() private control: NgControl,
                @Optional() @Host() private container: ControlContainer) {
        if ((this.eleRef.nativeElement as HTMLElement).nodeName.toUpperCase() !== 'FORM') {
            waitForControlInit(control || container).subscribe(ctrl => {
                if (ctrl) {
                    Object.defineProperty(ctrl, ControlBindElementDirective.ELEMENT_BIND_KEY, {
                        value: this.eleRef.nativeElement
                    });
                }
            });
        }
    }
}