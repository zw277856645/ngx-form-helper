import { Component } from '@angular/core';
import { uuid } from 'cmjs-lib';

@Component({
    templateUrl: './demo.component.html',
    styleUrls: [ './demo.component.less' ]
})
export class DemoComponent {

    name: string;
    desc: string;
    type: number = 0;
    sex: string;
    love: string;
    cks: any[] = [];
    remote: string;
    remote2: string;
    birth: string;
    uuid = uuid;
    pageHeight = 0;
    birth2: string;
    addr: string;
    issue: string;
    addr2: string;
    issue2: string;
    url: string;
    hidden: string;

    constructor() {
        this.cks = [
            { label: 'ck1', checked: false, uuid: uuid(8) },
            { label: 'ck2', checked: false, uuid: uuid(8) },
            { label: 'ck3', checked: false, uuid: uuid(8) }
        ];
    }

    addCK(name: string) {
        this.cks.push({
            label: 'ck' + (this.cks.length + 1),
            checked: false,
            uuid: uuid(8)
        });
    }

    removeCk(i: number, name: string) {
        this.cks.splice(i, 1);
    }

    trackByCk(i: number, ck: any) {
        return ck.uuid;
    }

    addHeight() {
        this.pageHeight += 1000;
    }

}
