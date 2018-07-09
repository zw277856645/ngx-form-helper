import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
export class DemoComponent implements AfterViewInit {

    @ViewChild('modal') modal: ElementRef;
    @ViewChild('modalInner') modalInner: ElementRef;

    config: FormHelperConfig;
    config2: FormHelperConfig;
    config3: FormHelperConfig;
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
    accordionActive = false;
    pageHeight = 0;
    accordionActive2 = false;
    birth2: string;
    addr: string;
    issue: string;
    addr2: string;
    issue2: string;

    constructor() {
        this.cks = [
            { label: 'ck1', checked: false, uuid: uuid(8) },
            { label: 'ck2', checked: false, uuid: uuid(8) },
            { label: 'ck3', checked: false, uuid: uuid(8) }
        ];

        this.config = {
            onSuccess: () => {
                return Observable.interval(0).map(() => {
                    console.log(444);
                }).first();
            }
        };

        this.config2 = {
            context: '.ui.page.modals',
            extraSubmits: '.modal-scroll .actions .approve'
        };

        this.config3 = {
            context: '..',
            extraSubmits: '.modal-inner-scroll .actions .approve'
        };
    }

    ngAfterViewInit() {
        $(this.modal.nativeElement)
            .modal({
                onApprove: () => false
            })
            .modal('attach events', '.modal-button', 'show');

        $(this.modalInner.nativeElement)
            .modal({
                onApprove: () => false
            })
            .modal('attach events', '.modal-inner-button', 'show');
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

    addHeight() {
        this.pageHeight += 1000;
    }
}
