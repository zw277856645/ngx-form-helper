import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';

export function checkboxRequired(
    { minCheckedNum, maxCheckedNum }: { minCheckedNum?: number, maxCheckedNum?: number }
): ValidatorFn {
    return (c: AbstractControl) => {
        if (c instanceof FormGroup) {
            let checkedNum = 0;

            for (let name in c.controls) {
                if (c.controls[ name ].value) {
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
    selector: '[checkboxRequired][ngModelGroup],[checkboxRequired][formGroup],[checkboxRequired][formGroupName]',
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

    validate(c: AbstractControl) {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return checkboxRequired({ minCheckedNum: this.minCheckedNum, maxCheckedNum: this.maxCheckedNum })(c);
    }
}
