import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormHelperDirective } from './form-helper.directive';
import { ElementBindToNgModelGroupDirective } from './elem-bind-to-group.directive';
import { ElementBindToNgModelDirective } from './elem-bind-to-model.directive';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [
        FormHelperDirective,
        ElementBindToNgModelDirective,
        ElementBindToNgModelGroupDirective
    ],
    exports: [
        FormHelperDirective,
        ElementBindToNgModelDirective,
        ElementBindToNgModelGroupDirective
    ]
})
export class FormHelperModule {
}
