import { uuid } from '@demacia/cmjs-lib';
import { Component } from '@angular/core';
import { ModalDirective } from '../directive/modal.directive';
import { SubmitCallback } from '../../src/form-helper.directive';

@Component({
    templateUrl: './template-driven.component.html',
    styleUrls: [ './template-driven.component.less' ]
})
export class TemplateDrivenComponent {

    name: string;
    desc: string;
    type: number = 0;
    sex: string;
    sex2: string;
    love: string;
    cks: any[] = [];
    birth: string;
    birth2: string;
    birth3: string;
    addr: string;
    issue: string;
    addr2: string;
    issue2: string;
    hidden: string;
    assertMatch: string[] = [];

    nameMessages = [
        { error: 'trimmedRequired', message: '不能为空' },
        { error: 'nameUnique', message: '重复', async: true }
    ];

    assertMatchMessages = {
        listRequired: '不能为空',
        listRequiredMin: { message: '至少设置{{value}}个值', context: { value: 2 } },
        listRequiredMax: { message: '至多设置{{value}}个值', context: { value: 4 } }
    };

    constructor() {
        this.cks = [
            { label: 'ck1', checked: false, uuid: uuid(8) },
            { label: 'ck2', checked: false, uuid: uuid(8) },
            { label: 'ck3', checked: false, uuid: uuid(8) }
        ];
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

    hideModal(submitCallback: SubmitCallback, modalCtrl: ModalDirective) {
        modalCtrl.behavior('hide');
        submitCallback.complete({ reset: true });
    }

}
