import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormHelperDirective } from './form-helper.directive';
import { SubmitHandlerDefaultDirective } from './submit-handler.default.directive';
import { SubmitHandlerDefaultService } from './submit-handler.default.service';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [
        FormHelperDirective,
        SubmitHandlerDefaultDirective
    ],
    exports: [
        FormHelperDirective,
        SubmitHandlerDefaultDirective
    ],
    providers: [
        SubmitHandlerDefaultService
    ]
})
export class FormHelperModule {
}
