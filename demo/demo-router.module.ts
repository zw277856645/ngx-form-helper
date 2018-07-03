import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DemoComponent } from './demo.component';
import { OtherComponent } from './other.component';

const routes: Routes = [
    {
        path: '',
        component: DemoComponent
    },
    {
        path: 'other',
        component: OtherComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class DemoRouterModule {
}


