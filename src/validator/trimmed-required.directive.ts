import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Directive({
    selector: '[trimmedRequired][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TrimmedRequiredDirective, multi: true }
    ]
})
export class TrimmedRequiredDirective implements Validator {

    validate(c: AbstractControl): ValidationErrors | null {
        let v = isNullOrUndefined(c.value) ? '' : String(c.value);
        return v && v.trim().length > 0 ? null : { trimmedRequired: true };
    }
}
