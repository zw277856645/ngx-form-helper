import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/switchMap';
import { ValidationErrors } from '@angular/forms';
import { getDebounceTime } from './form-helper-utils';
const $ = require('jquery');

export class AsyncValidatorLimit {

    protected debounceTime: number;

    constructor(ele: ElementRef) {
        this.debounceTime = getDebounceTime($(ele.nativeElement));
    }

    protected limit(stream: Observable<ValidationErrors | null>): Observable<ValidationErrors | null> {
        return Observable.interval(this.debounceTime).first().switchMap(() => stream);
    }
}