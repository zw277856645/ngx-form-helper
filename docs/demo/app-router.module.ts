import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TemplateDrivenComponent } from './template-driven/template-driven.component';

const routes: Routes = [
    {
        path: 'template-driven',
        component: TemplateDrivenComponent
    },
    {
        path: '',
        redirectTo: 'template-driven',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class AppRouterModule {
}