import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DemoComponent } from './demo.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormHelperModule } from '../src/form-helper.module';
import { DemoRouterModule } from './demo-router.module';
import { OtherComponent } from './other.component';
import { AppComponent } from './app.component';
import { GroupedCheckboxRequiredDirective } from './directive/grouped-checkbox-required.directive';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        FormHelperModule,
        DemoRouterModule
    ],
    declarations: [
        AppComponent,
        DemoComponent,
        OtherComponent,
        GroupedCheckboxRequiredDirective
    ],
    bootstrap: [ AppComponent ]
})
export class DemoModule {
}
