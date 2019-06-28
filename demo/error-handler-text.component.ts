import { Component } from '@angular/core';
import { SubmitWrapper } from '../src/form-helper.directive';
import { of } from 'rxjs';

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

    save(submitWrapper: SubmitWrapper) {
        submitWrapper(of(this.host)).subscribe(res => {
            console.log(res);
        });
    }

    resultOkAssertion(res: any) {
        return res !== '1';
    }

    save2(submitWrapper: SubmitWrapper) {
        setTimeout(() => submitWrapper().subscribe(() => console.log('save2')));
    }

}
