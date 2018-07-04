import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

@Injectable()
export class NameValidateService {

    isNameUnique(name: string) {
        return Observable.of(name).map(name => name == 'admin');
    }
}