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
import { AccordionDirective } from './directive/accordion.directive';
import { ModalDirective } from './directive/modal.directive';
import { HttpClientModule } from '@angular/common/http';
import { TextareaAutoSizeDirective } from './directive/textarea-auto-size.directive';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        FormHelperModule,
        DemoRouterModule,
        TagInputModule
    ],
    declarations: [
        AppComponent,
        DemoComponent,
        ErrorHandlerTextComponent,
        GroupedCheckboxRequiredDirective,
        NameUniqueDirective,
        DropdownDirective,
        AccordionDirective,
        ModalDirective,
        TextareaAutoSizeDirective
    ],
    providers: [
        NameValidateService
    ],
    bootstrap: [ AppComponent ]
})
export class DemoModule {
}
