import { AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { Directive } from '@angular/core';
import { NameValidateService } from './name-unique.service';
import { map, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';

export function nameUnique(nameValidateService: NameValidateService): AsyncValidatorFn {
    return (c: AbstractControl) => {
        return timer(300).pipe(switchMap(() => {
            return nameValidateService.isNameUnique(c.value).pipe(map((res: any) => {
                return !res ? null : { nameUnique: true };
            }));
        }));
    };
}

@Directive({
    selector: '[nameUnique]',
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useExisting: NameUniqueDirective, multi: true }
    ]
})
export class NameUniqueDirective implements AsyncValidator {

    private ctrl: AbstractControl;

    constructor(private nameValidateService: NameValidateService) {
    }

    validate(c: AbstractControl) {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return nameUnique(this.nameValidateService)(c);
    }

}