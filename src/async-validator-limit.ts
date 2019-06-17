import { Input } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import { first, switchMap } from 'rxjs/operators';

export abstract class AsyncValidatorLimit {

    @Input() debounceTime: number = 300;

    protected limit(stream: Observable<ValidationErrors | null>): Observable<ValidationErrors | null> {
        return interval(+this.debounceTime).pipe(
            first(),
            switchMap(() => stream)
        );
    }

}