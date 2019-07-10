import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { DemoModule } from './demo.module';
import { environment } from './environment/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(DemoModule);
