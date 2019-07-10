import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class NameValidateService {

    isNameUnique(name: string) {
        return of(name).pipe(delay(300), map(() => name === 'admin'));
    }
}