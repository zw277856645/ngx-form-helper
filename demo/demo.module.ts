import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DemoComponent } from './demo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormHelperModule } from '../src/form-helper.module';
import { DemoRouterModule } from './demo-router.module';
import { AppComponent } from './app.component';
import { GroupedCheckboxRequiredDirective } from './directive/grouped-checkbox-required.directive';
import { NameUniqueDirective } from './directive/name-unique.directive';
import { NameValidateService } from './directive/name-unique.service';
import { ErrorHandlerTextComponent } from './error-handler-text.component';
import { DropdownDirective } from './directive/dropdown.directive';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        FormHelperModule,
        DemoRouterModule
    ],
    declarations: [
        AppComponent,
        DemoComponent,
        ErrorHandlerTextComponent,
        GroupedCheckboxRequiredDirective,
        NameUniqueDirective,
        DropdownDirective
    ],
    providers: [
        NameValidateService
    ],
    bootstrap: [ AppComponent ]
})
export class DemoModule {
}
