import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DemoComponent } from './demo.component';
import { DemoTextComponent } from './demo-text.component';

const routes: Routes = [
    {
        path: '',
        component: DemoComponent
    },
    {
        path: 'error-handler-text',
        component: DemoTextComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class DemoRouterModule {
}