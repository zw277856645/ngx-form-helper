import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';

@Injectable()
export class NameValidateService {

    constructor(private http: HttpClient) {
    }

    isNameUnique(name: string) {
        let params: any = { name, domainId: '5a9e04c0a7d983569fef97c0', env: 'LOCAL' };
        return this.http.get('http://cps-local.elenet.me:8080/cps/testcase/checkName', { params }).pipe(delay(500));
    }
}