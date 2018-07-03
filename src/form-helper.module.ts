import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormHelperDirective } from './form-helper.directive';
import { ElementBindToControlDirective } from './elem-bind-to-control.directive';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [
        FormHelperDirective,
        ElementBindToControlDirective
    ],
    exports: [
        FormHelperDirective,
        ElementBindToControlDirective
    ]
})
export class FormHelperModule {
}
