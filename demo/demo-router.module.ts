import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DemoTemplateDrivenComponent } from './demo-template-driven.component';
import { DemoModelDrivenComponent } from './demo-model-driven.component';

const routes: Routes = [
    {
        path: '',
        component: DemoTemplateDrivenComponent
    },
    {
        path: 'model-driven',
        component: DemoModelDrivenComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class DemoRouterModule {
}