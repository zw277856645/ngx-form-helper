import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { NameValidateService } from './name-unique.service';
import { AsyncValidatorLimit } from '../../src/async-validator-limit';
import { map } from 'rxjs/operators';

@Directive({
    selector: '[nameUnique]',
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useExisting: NameUniqueDirective, multi: true }
    ]
})
export class NameUniqueDirective extends AsyncValidatorLimit implements AsyncValidator {

    private ctrl: AbstractControl;

    constructor(private nameValidateService: NameValidateService) {
        super();
    }

    validate(c: AbstractControl): Observable<ValidationErrors | null> {
        if (!this.ctrl) {
            this.ctrl = c;
        }

        return super.limit(
            this.nameValidateService.isNameUnique(c.value).pipe(
                map((res: any) => {
                    if (res.status === 'SUCCESS') {
                        return !res.data ? null : { nameUnique: true };
                    } else {
                        return { nameUnique: true };
                    }
                })
            )
        );
    }

}