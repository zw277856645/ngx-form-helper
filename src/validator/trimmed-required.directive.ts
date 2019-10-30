import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';
import { InputBoolean } from '@demacia/cmjs-lib';

export function trimmedRequired(required: boolean = true): ValidatorFn {
    return (c: AbstractControl) => {
        if (required) {
            let v = (c.value === null || c.value === undefined) ? '' : String(c.value);

            return v && v.trim().length > 0 ? null : { trimmedRequired: true };
        }

        return null;
    };
}

@Directive({
    selector: '[trimmedRequired][ngModel],[trimmedRequired][formControl],[trimmedRequired][formControlName]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TrimmedRequiredDirective, multi: true }
    ]
})
export class TrimmedRequiredDirective implements Validator, OnChanges {

    @Input() @InputBoolean() trimmedRequired: boolean;

    private ctrl: AbstractControl;

    ngOnChanges() {
        if (this.ctrl) {
            this.ctrl.updateValueAndValidity();
        }
    }

    validate(c: AbstractControl) {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return trimmedRequired(this.trimmedRequired)(c);
    }
}
