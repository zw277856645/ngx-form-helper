import { Directive } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[checkboxRequired][ngModelGroup]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: GroupedCheckboxRequiredDirective, multi: true }
    ]
})
export class GroupedCheckboxRequiredDirective implements Validator {

    validate(group: AbstractControl): ValidationErrors | null {
        if (group instanceof FormGroup) {
            for (let c in group.controls) {
                if (group.controls[ c ].value) {
                    return null;
                }
            }

            return { checkboxRequired: true };
        }

        return null;
    }
}
