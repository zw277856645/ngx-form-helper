import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Directive, ElementRef } from '@angular/core';
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

    constructor(private nameValidateService: NameValidateService,
                private ele: ElementRef) {
        super(ele);
    }

    validate(c: AbstractControl): Observable<ValidationErrors | null> {
        return super.limit(
            this.nameValidateService.isNameUnique(c.value).pipe(
                map(exist => {
                    return exist ? { nameUnique: true } : null;
                })
            )
        );
    }

}