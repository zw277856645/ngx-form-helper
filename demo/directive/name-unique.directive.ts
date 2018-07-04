import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Directive, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/switchMap';
import { NameValidateService } from './name-unique.service';
import { AsyncValidatorLimit } from '../../src/async-validator-limit';

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
            this.nameValidateService.isNameUnique(c.value).map(exist => {
                return exist ? { nameUnique: true } : null;
            })
        );
    }

}