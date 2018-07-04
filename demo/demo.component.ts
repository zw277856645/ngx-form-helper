import { Component, OnInit } from '@angular/core';
import { FormHelperConfig } from '../src/form-helper-config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import { uuid } from 'cmjs-lib';

@Component({
    selector: 'my-app',
    templateUrl: './demo.component.html',
    styleUrls: [ './demo.component.less' ]
})
export class DemoComponent implements OnInit {

    config: FormHelperConfig;
    name: string;
    desc: string;
    type: number = 0;
    sex: string;
    love: string;
    cks: any[] = [];
    remote: string;
    birth: string;
    uuid = uuid;
    accordionActive = false;

    constructor() {
        this.cks = [
            { label: 'ck1', checked: false, uuid: uuid(8) },
            { label: 'ck2', checked: false, uuid: uuid(8) },
            { label: 'ck3', checked: false, uuid: uuid(8) }
        ];
    }

    ngOnInit() {
        this.config = {
            submitHandler: {
                name: 'loader',
                config: {
                    //iconClassName: 'icon notched circle loading',
                    //iconToggleStrategy: 'replace',
                    //iconSelector: false
                }
            },
            onSuccess: () => {
                return Observable.interval(0).map(() => {
                    console.log(444);
                }).first();
            }
        };
    }

    addCK() {
        this.cks.push({
            label: 'ck' + (this.cks.length + 1),
            checked: false,
            uuid: uuid(8)
        });
    }

    removeCk(i: number) {
        this.cks.splice(i, 1);
    }

    trackByCk(i: number, ck: any) {
        return ck.uuid;
    }
}
