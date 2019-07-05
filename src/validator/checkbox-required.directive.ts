import { Directive, Input, OnChanges } from '@angular/core';
import {
    AbstractControl, FormArray, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn
} from '@angular/forms';
import { arrayOfAbstractControls } from '../utils';

export function checkboxRequired(
    { minCheckedNum, maxCheckedNum }: { minCheckedNum?: number, maxCheckedNum?: number }
): ValidatorFn {
    return (c: AbstractControl) => {
        if (c instanceof FormGroup || c instanceof FormArray) {
            let checkedNum = 0;

            for (let item of arrayOfAbstractControls(c.controls)) {
                if (item.control.value) {
                    checkedNum++;
                }
            }

            if (!checkedNum) {
                return { checkboxRequired: true };
            }

            let minNum = minCheckedNum ? +minCheckedNum : 0;
            if (minNum && checkedNum < minNum) {
                return { checkboxRequiredMin: true };
            }

            let maxNum = maxCheckedNum ? +maxCheckedNum : 0;
            if (maxNum && checkedNum > maxNum) {
                return { checkboxRequiredMax: true };
            }
        }

        return null;
    };
}

@Directive({
    selector: `
        [checkboxRequired][ngModelGroup],
        [checkboxRequired][formGroup],[checkboxRequired][formGroupName],
        [checkboxRequired][formArray],[checkboxRequired][formArrayName]
    `,
    providers: [
        { provide: NG_VALIDATORS, useExisting: CheckboxRequiredDirective, multi: true }
    ]
})
export class CheckboxRequiredDirective implements Validator, OnChanges {

    @Input() minCheckedNum: number;

    @Input() maxCheckedNum: number;

    private ctrl: AbstractControl;

    ngOnChanges() {
        if (this.ctrl) {
            this.ctrl.updateValueAndValidity();
        }
    }

    validate(c: AbstractControl): ValidationErrors | null {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return checkboxRequired({ minCheckedNum: this.minCheckedNum, maxCheckedNum: this.maxCheckedNum })(c);
    }
}
