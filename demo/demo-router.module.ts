import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DemoComponent } from './demo.component';
import { ErrorHandlerTextComponent } from './error-handler-text.component';

const routes: Routes = [
    {
        path: '',
        component: DemoComponent
    },
    {
        path: 'error-handler-text',
        component: ErrorHandlerTextComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class DemoRouterModule {
}