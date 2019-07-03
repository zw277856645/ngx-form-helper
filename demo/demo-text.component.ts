import { Component } from '@angular/core';
import { SubmitWrapper } from '../src/form-helper.directive';

@Component({
    templateUrl: './demo-text.component.html',
    styleUrls: [
        './demo.component.less',
        './demo-text.component.less'
    ]
})
export class DemoTextComponent {

    host: string;
    name: string;
    sex: string;
    actionInputType: number = 0;
    actionInput: string;
    pageHeight = 0;
    assertMatch: string[] = [];

    save(submitWrapper: SubmitWrapper) {
        setTimeout(() => submitWrapper().subscribe(() => console.log('save')));
    }

}
