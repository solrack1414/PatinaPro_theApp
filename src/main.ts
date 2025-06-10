import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@lottiefiles/lottie-player'; 

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
