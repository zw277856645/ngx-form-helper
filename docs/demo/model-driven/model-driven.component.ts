import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { checkboxRequired, listRequired, trimmedRequired } from '@demacia/ngx-form-helper';
import { NameValidateService } from '../directive/name-unique.service';
import { nameUnique } from '../directive/name-unique.directive';

@Component({
    templateUrl: './model-driven.component.html',
    styleUrls: [ '../template-driven/template-driven.component.less' ]
})
export class ModelDrivenComponent {

    formGroup: FormGroup;
    cks: any[] = [];

    nameMessages = {
        nameUnique: { message: '重复', async: true, order: 2 },
        trimmedRequired: '不能为空'
    };

    constructor(private nameValidateService: NameValidateService,
                private fb: FormBuilder) {
        this.cks = [
            { label: 'ck1', checked: false },
            { label: 'ck2', checked: false },
            { label: 'ck3', checked: false }
        ];

        this.formGroup = fb.group({
            name: [ null, [ trimmedRequired() ], [ nameUnique(nameValidateService) ] ],
            desc: [ null, [ trimmedRequired() ] ],
            hidden: [ null, [ Validators.required ] ],
            love: [ null, [ Validators.required ] ],
            sex: [ null, [ trimmedRequired(), Validators.pattern('^[a-zA-Z]*$') ] ],
            group: fb.array([], [ checkboxRequired({ minCheckedNum: 2, maxCheckedNum: 4 }) ]),
            assertMatch: [ [], [ listRequired({ minListNum: 2, maxListNum: 4 }) ] ],
            gp: fb.group({
                birth: [ null, [ Validators.required ] ]
            }),
            gp2: fb.group({
                birth2: [ null, [ Validators.required ] ]
            }),
            gp3: fb.group({
                birth3: [ null, [ Validators.required ] ]
            })
        });

        this.cks.forEach(ck => this.group.push(fb.control(ck.checked)));
    }

    get group() {
        return this.formGroup.get('group') as FormArray;
    }

    addCK() {
        let ck = {
            label: 'ck' + (this.cks.length + 1),
            checked: false
        };

        this.cks.push(ck);
        this.group.push(this.fb.control(ck.checked));
    }

    removeCk(i: number) {
        this.cks.splice(i, 1);
        this.group.removeAt(i);
    }

}
