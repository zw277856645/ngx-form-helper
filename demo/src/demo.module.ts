import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DemoTemplateDrivenComponent } from './demo-template-driven.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DemoRouterModule } from './demo-router.module';
import { AppComponent } from './app.component';
import { NameUniqueDirective } from './directive/name-unique.directive';
import { NameValidateService } from './directive/name-unique.service';
import { DemoModelDrivenComponent } from './demo-model-driven.component';
import { DropdownDirective } from './directive/dropdown.directive';
import { AccordionDirective } from './directive/accordion.directive';
import { ModalDirective } from './directive/modal.directive';
import { HttpClientModule } from '@angular/common/http';
import { TextareaAutoSizeDirective } from './directive/textarea-auto-size.directive';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormHelperModule } from 'ngx-form-helper';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        DemoRouterModule,
        TagInputModule,
        FormHelperModule
    ],
    declarations: [
        AppComponent,
        DemoTemplateDrivenComponent,
        DemoModelDrivenComponent,
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
