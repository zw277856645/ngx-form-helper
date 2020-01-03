import { Directive, DoCheck, Input, IterableDiffer, IterableDiffers, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { isNotFirstChange } from '../utils';
import { InputNumber } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
export function listRequired({ minListNum, maxListNum }: { minListNum?: number, maxListNum?: number }): ValidatorFn {
    return (c: AbstractControl) => {
        if (!c.value || !c.value.length) {
            return { listRequired: true };
        }

        let minNum = minListNum ? +minListNum : 0;
        if (minNum > 0 && c.value.length < minNum) {
            return { listRequiredMin: { value: minListNum } };
        }

        let maxNum = maxListNum ? +maxListNum : 0;
        if (maxNum > 0 && c.value.length > maxNum) {
            return { listRequiredMax: { value: maxListNum } };
        }
    };
}

/**
 * 验证数组长度在 minListNum ~ maxListNum 之间
 *
 * - 验证失败返回
 *   - 数组不存在或长度为0时返回 `{ listRequired: true }`
 *   - [minListNum]{@link #minListNum} 验证失败返回 `{ listRequiredMin: { value: xxx } }`
 *   - [maxListNum]{@link #maxListNum} 验证失败返回 `{ listRequiredMax: { value: xxx } }`
 *
 * ---
 *
 * 模板驱动方式
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
 * ~~~
 *
 * 模型驱动方式
 *
 * ~~~ html
 * <input type="text" name="name" formControlName="name">
 * ~~~
 *
 * ~~~ js
 * \@Component({ ... })
 * export class ExampleComponent {
 *
 *     name = new FormControl('', [ listRequired({ minListNum: 2, maxListNum: 4 }) ]);
 * }
 * ~~~
 */
@Directive({
    selector: '[listRequired][ngModel],[listRequired][formControl],[listRequired][formControlName]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ListRequiredDirective, multi: true }
    ]
})
export class ListRequiredDirective implements Validator, DoCheck, OnChanges {

    /**
     * @ignore
     */
    @Input() ngModel: any;

    /**
     * 数组最小长度，非必须
     */
    @Input() @InputNumber() minListNum: number;

    /**
     * 数组最大长度，非必须
     */
    @Input() @InputNumber() maxListNum: number;

    private ctrl: AbstractControl;
    private arrayDiffer: IterableDiffer<any>;

    constructor(private iterableDiffers: IterableDiffers) {
        this.arrayDiffer = this.iterableDiffers.find([]).create();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (isNotFirstChange(changes.minListNum) || isNotFirstChange(changes.maxListNum)) {
            if (this.ctrl) {
                this.ctrl.updateValueAndValidity();
            }
        }
    }

    ngDoCheck() {
        if (this.ctrl) {
            const changes = this.arrayDiffer.diff(this.ngModel);
            if (changes) {
                this.ctrl.updateValueAndValidity();
            }
        }
    }

    /**
     * @ignore
     */
    validate(c: AbstractControl): ValidationErrors | null {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return listRequired({ minListNum: this.minListNum, maxListNum: this.maxListNum })(c);
    }
}