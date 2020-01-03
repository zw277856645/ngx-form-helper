import { Directive, Input, OnChanges } from '@angular/core';
import {
    AbstractControl, FormArray, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn
} from '@angular/forms';
import { arrayOfAbstractControls } from '../utils';
import { InputNumber } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
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
                return { checkboxRequiredMin: { value: minCheckedNum } };
            }

            let maxNum = maxCheckedNum ? +maxCheckedNum : 0;
            if (maxNum && checkedNum > maxNum) {
                return { checkboxRequiredMax: { value: maxCheckedNum } };
            }
        }

        return null;
    };
}

/**
 * 验证某表单组下的多选框(checkbox)勾选数量在 minCheckedNum ~ maxCheckedNum 之间
 *
 * - 验证失败返回
 *   - 勾选数量为0时返回 `{ checkboxRequired: true }`
 *   - [minCheckedNum]{@link #minCheckedNum} 验证失败返回 `{ checkboxRequiredMin: { value: xxx } }`
 *   - [maxCheckedNum]{@link #maxCheckedNum} 验证失败返回 `{ checkboxRequiredMax: { value: xxx } }`
 *
 * ---
 *
 * 模板驱动方式
 *
 * ~~~ html
 * <div ngModelGroup="group" checkboxRequired minCheckedNum="2" maxCheckedNum="4">
 *   <!-- checkboxes -->
 *   <input type="checkbox" name="ck-1" [(ngModel)]="checked1">
 *   <input type="checkbox" name="ck-2" [(ngModel)]="checked2">
 *   ...
 * </div>
 * ~~~
 *
 * 模型驱动方式
 *
 * ~~~ html
 * <div ngModelGroup="group" formGroup="group">
 *   <!-- checkboxes -->
 *   <input type="checkbox" name="ck-1" [(ngModel)]="checked1">
 *   <input type="checkbox" name="ck-2" [(ngModel)]="checked2">
 *   ...
 * </div>
 * ~~~
 *
 * ~~~ js
 * \@Component({ ... })
 * export class ExampleComponent {
 *
 *     group = new FormGroup([], [ checkboxRequired({ minCheckedNum: 2, maxCheckedNum: 4 }) ]);
 * }
 * ~~~
 */
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

    /**
     * 勾选数量最小值，非必须
     */
    @Input() @InputNumber() minCheckedNum: number;

    /**
     * 勾选数量最大值，非必须
     */
    @Input() @InputNumber() maxCheckedNum: number;

    private ctrl: AbstractControl;

    ngOnChanges() {
        if (this.ctrl) {
            this.ctrl.updateValueAndValidity();
        }
    }

    /**
     * @ignore
     */
    validate(c: AbstractControl): ValidationErrors | null {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return checkboxRequired({ minCheckedNum: this.minCheckedNum, maxCheckedNum: this.maxCheckedNum })(c);
    }
}
