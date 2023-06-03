import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { PainComponent } from './components/pain/pain.component';
import { FooterComponent } from './components/footer/footer.component';
import { WeatherAnimationComponent } from './components/weather-animation/weather-animation.component';
import { NgParticlesModule } from 'ng-particles';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { ModalComponent } from './components/modal/modal.component';
import { SettingsComponent } from './components/settings/settings.component';
import { FontSettingComponent } from './components/settings/font-setting/font-setting.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    PainComponent,
    FooterComponent,
    WeatherAnimationComponent,
    WorkspaceComponent,
    ModalComponent,
    SettingsComponent,
    FontSettingComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgParticlesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
