import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormHelperDirective } from './form-helper.directive';
import { TrimmedRequiredDirective } from './validator/trimmed-required.directive';
import { SubmitHandlerLoaderDirective } from './submit-handler/submit-handler-loader.directive';
import { ErrorHandlerTextDirective } from './error-handler/text/error-handler-text.directive';
import { ErrorHandlerTooltipDirective } from './error-handler/tooltip/error-handler-tooltip.directive';
import { ErrorHandlerTextMessageComponent } from './error-handler/text/error-handler-text-message.component';
import { ErrorHandlerTooltipMessageComponent } from './error-handler/tooltip/error-handler-tooltip-message.component';
import { ListRequiredDirective } from './validator/list-required.directive';
import { CheckboxRequiredDirective } from './validator/checkbox-required.directive';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [
        FormHelperDirective,

        TrimmedRequiredDirective,
        ListRequiredDirective,
        CheckboxRequiredDirective,

        SubmitHandlerLoaderDirective,

        ErrorHandlerTextDirective,
        ErrorHandlerTextMessageComponent,

        ErrorHandlerTooltipDirective,
        ErrorHandlerTooltipMessageComponent
    ],
    exports: [
        FormHelperDirective,
        TrimmedRequiredDirective,
        ListRequiredDirective,
        CheckboxRequiredDirective,
        SubmitHandlerLoaderDirective,
        ErrorHandlerTextDirective,
        ErrorHandlerTooltipDirective,
        ErrorHandlerTextMessageComponent,
        ErrorHandlerTooltipMessageComponent
    ]
})
export class FormHelperModule {
}
