import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

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

    validate(c: AbstractControl): ValidationErrors | null {
        if (!this.ctrl) {
            this.ctrl = c;
        }

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

            let minNum = this.minCheckedNum ? +this.minCheckedNum : 0;
            if (minNum && checkedNum < minNum) {
                return { checkboxRequiredMin: true };
            }

            let maxNum = this.maxCheckedNum ? +this.maxCheckedNum : 0;
            if (maxNum && checkedNum > maxNum) {
                return { checkboxRequiredMax: true };
            }
        }

        return null;
    }
}
