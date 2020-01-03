import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';
import { InputBoolean } from '@demacia/cmjs-lib';

/**
 * @ignore
 */
export function trimmedRequired(required: boolean = true): ValidatorFn {
    return (c: AbstractControl) => {
        if (required) {
            let v = (c.value === null || c.value === undefined) ? '' : String(c.value);

            return v && v.trim().length > 0 ? null : { trimmedRequired: true };
        }

        return null;
    };
}

/**
 * 验证是否为空。同 angular 自带的 required 区别是本规则剔除空白符
 *
 * - 验证失败时返回 `{ trimmedRequired: true }`
 *
 * ---
 *
 * 模板驱动方式
 *
 * ~~~ html
 * <input type="text" name="name" [(ngModel)]="xxx" trimmedRequired>
 * <input type="text" name="name" [(ngModel)]="xxx" [trimmedRequired]="true">
 * <input type="text" name="name" [(ngModel)]="xxx" [trimmedRequired]="false">
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
 *     name = new FormControl('', [ trimmedRequired() ]);
 * }
 * ~~~
 */
@Directive({
    selector: '[trimmedRequired][ngModel],[trimmedRequired][formControl],[trimmedRequired][formControlName]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TrimmedRequiredDirective, multi: true }
    ]
})
export class TrimmedRequiredDirective implements Validator, OnChanges {

    /**
     * 是否必须
     */
    @Input() @InputBoolean() trimmedRequired: boolean;

    private ctrl: AbstractControl;

    ngOnChanges() {
        if (this.ctrl) {
            this.ctrl.updateValueAndValidity();
        }
    }

    /**
     * @ignore
     */
    validate(c: AbstractControl) {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return trimmedRequired(this.trimmedRequired)(c);
    }
}
