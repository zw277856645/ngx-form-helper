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
import { ControlBindElementDirective } from './error-handler/control-bind-element.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FormHelperDirective,
        ControlBindElementDirective,

        // validations
        TrimmedRequiredDirective,
        ListRequiredDirective,
        CheckboxRequiredDirective,

        // submit handlers
        SubmitHandlerLoaderDirective,

        // simple error handler
        ErrorHandlerSimpleDirective,

        // text error handler
        ErrorHandlerTextComponent,
        ErrorHandlerTextMessageComponent,

        // tooltip error handler
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
        ErrorHandlerTooltipMessageComponent,
        ControlBindElementDirective
    ]
})
export class FormHelperModule {
}
