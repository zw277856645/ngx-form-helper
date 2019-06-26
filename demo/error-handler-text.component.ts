import { Component } from '@angular/core';

@Component({
    templateUrl: './error-handler-text.component.html',
    styleUrls: [
        './demo.component.less',
        './error-handler-text.component.less'
    ]
})
export class ErrorHandlerTextComponent {

    host: string;
    name: string;
    sex: string;
    actionInputType: number = 0;
    actionInput: string;
    pageHeight = 0;
    assertMatch: string[] = [];

    save() {
        return Promise.resolve(this.host);
    }

    afterSave(res: any) {
        console.log(res);
    }

    requestOkAssertion(res: any) {
        return res !== '1';
    }

}
