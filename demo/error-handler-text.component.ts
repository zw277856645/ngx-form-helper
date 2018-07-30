import { Component, ViewChild } from '@angular/core';
import { FormHelperConfig } from '../src/form-helper-config';
import { FormHelperDirective } from '../src/form-helper.directive';
import { NgModel } from '@angular/forms';

@Component({
    templateUrl: './error-handler-text.component.html',
    styleUrls: [
        'demo.component.less',
        './error-handler-text.component.less'
    ]
})
export class ErrorHandlerTextComponent {

    @ViewChild('actionInputCtrl') actionInputCtrl: NgModel;

    config1: FormHelperConfig;
    config2: FormHelperConfig;
    host: string;
    hosts: string[] = [];
    name: string;
    actionInputType: number = 0;
    actionInput: string;

    constructor() {
        this.config1 = {
            errorHandler: 'text',
            submitHandler: false,
            onSuccess: () => this.hosts.push(this.host)
        };

        this.config2 = {
            errorHandler: 'text'
        };
    }

    reset(form: FormHelperDirective) {
        form.reset();
    }

}
