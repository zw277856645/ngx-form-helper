import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NameValidateService {

    isNameUnique(name: string) {
        return of(name).pipe(map(name => name === 'admin'));
    }
}