import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouterModule } from './app-router.module';
import { AppComponent } from './app.component';
import { TemplateDrivenComponent } from './template-driven/template-driven.component';
import { AccordionDirective } from './directive/accordion.directive';
import { DropdownDirective } from './directive/dropdown.directive';
import { ModalDirective } from './directive/modal.directive';
import { NameUniqueDirective } from './directive/name-unique.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormHelperModule } from '../../src/form-helper.module';
import { TagInputModule } from 'ngx-chips';
import { TextareaAutoHeightModule } from '@demacia/ngx-textarea-auto-height';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRouterModule,
        ReactiveFormsModule,
        FormsModule,
        TagInputModule,
        FormHelperModule,
        TextareaAutoHeightModule
    ],
    declarations: [
        AppComponent,
        TemplateDrivenComponent,
        AccordionDirective,
        DropdownDirective,
        ModalDirective,
        NameUniqueDirective
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}