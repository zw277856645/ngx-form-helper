import { ElementRef } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import { getDebounceTime } from './form-helper-utils';
import { first, switchMap } from 'rxjs/operators';

export class AsyncValidatorLimit {

    protected debounceTime: number;

    constructor(ele: ElementRef) {
        this.debounceTime = getDebounceTime($(ele.nativeElement));
    }

    protected limit(stream: Observable<ValidationErrors | null>): Observable<ValidationErrors | null> {
        return interval(this.debounceTime).pipe(
            first(),
            switchMap(() => stream)
        );
    }
}