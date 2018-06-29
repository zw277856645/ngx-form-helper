import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DemoComponent } from './demo.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormHelperModule } from '../src/form-helper.module';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        FormHelperModule
    ],
    declarations: [
        DemoComponent
    ],
    bootstrap: [ DemoComponent ]
})
export class DemoModule {
}
