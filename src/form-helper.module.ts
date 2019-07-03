import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormHelperDirective } from './form-helper.directive';
import { TrimmedRequiredDirective } from './validator/trimmed-required.directive';
import { SubmitHandlerLoaderDirective } from './submit-handler/submit-handler-loader.directive';
import { ErrorHandlerTextComponent } from './error-handler/text/error-handler-text.component';
import { ErrorHandlerTooltipComponent } from './error-handler/tooltip/error-handler-tooltip.component';
import { ListRequiredDirective } from './validator/list-required.directive';
import { CheckboxRequiredDirective } from './validator/checkbox-required.directive';
import { ErrorHandlerSimpleDirective } from './error-handler/simple/error-handler-simple.directive';
import { ErrorHandlerTextMessageComponent } from './error-handler/text/error-handler-text-message.component';
import { ErrorHandlerTooltipMessageComponent } from './error-handler/tooltip/error-handler-tooltip-message.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FormHelperDirective,

        // validations
        TrimmedRequiredDirective,
        ListRequiredDirective,
        CheckboxRequiredDirective,

        // submit handlers
        SubmitHandlerLoaderDirective,

        // simple handler
        ErrorHandlerSimpleDirective,

        // text handler
        ErrorHandlerTextComponent,
        ErrorHandlerTextMessageComponent,

        // tooltip handler
        ErrorHandlerTooltipComponent,
        ErrorHandlerTooltipMessageComponent
    ],
    exports: [
        FormHelperDirective,
        TrimmedRequiredDirective,
        ListRequiredDirective,
        CheckboxRequiredDirective,
        SubmitHandlerLoaderDirective,
        ErrorHandlerSimpleDirective,
        ErrorHandlerTextComponent,
        ErrorHandlerTooltipComponent,
        ErrorHandlerTextMessageComponent,
        ErrorHandlerTooltipMessageComponent
    ]
})
export class FormHelperModule {
}
