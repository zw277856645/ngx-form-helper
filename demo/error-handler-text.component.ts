import { Component } from '@angular/core';
import { FormHelperConfig } from '../src/form-helper-config';

@Component({
    templateUrl: './error-handler-text.component.html',
    styleUrls: [
        'demo.component.less',
        './error-handler-text.component.less'
    ]
})
export class ErrorHandlerTextComponent {

    config1: FormHelperConfig;
    config2: FormHelperConfig;
    host: string;
    hosts: string[] = [];
    name: string;

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

}
