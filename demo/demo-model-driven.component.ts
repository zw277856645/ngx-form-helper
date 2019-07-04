import { Component } from '@angular/core';
import { SubmitWrapper } from '../src/form-helper.directive';
import { FormControl, FormGroup } from '@angular/forms';
import { trimmedRequired } from '../src/validator/trimmed-required.directive';

@Component({
    templateUrl: './demo-model-driven.component.html',
    styleUrls: [
        './demo-template-driven.component.less',
        './demo-model-driven.component.less'
    ]
})
export class DemoModelDrivenComponent {

    pageHeight = 0;
    formGroup: FormGroup;

    constructor() {
        this.formGroup = new FormGroup({
            name: new FormControl(null, [ trimmedRequired ])
        });
    }

    save(submitWrapper: SubmitWrapper) {
        setTimeout(() => submitWrapper().subscribe(() => console.log('save')));
    }

}
