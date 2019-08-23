import { Directive, DoCheck, Input, IterableDiffer, IterableDiffers, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { isNotFirstChange } from '../utils';
import { InputNumber } from 'cmjs-lib';

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

@Directive({
    selector: '[listRequired][ngModel],[listRequired][formControl],[listRequired][formControlName]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ListRequiredDirective, multi: true }
    ]
})
export class ListRequiredDirective implements Validator, DoCheck, OnChanges {

    @Input() ngModel: any;

    @Input() @InputNumber() minListNum: number;

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

    validate(c: AbstractControl): ValidationErrors | null {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return listRequired({ minListNum: this.minListNum, maxListNum: this.maxListNum })(c);
    }
}