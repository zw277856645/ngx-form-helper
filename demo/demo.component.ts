import { Component, OnInit } from '@angular/core';
import { FormHelperDirective } from '../src/form-helper.directive';

@Component({
    selector: 'my-app',
    templateUrl: './demo.component.html',
    styleUrls: [ './demo.component.less' ]
})
export class DemoComponent implements OnInit {

    name: string;
    desc: string;
    type: number = 0;
    sex: string;

    ngOnInit() {
    }
}
