import { Component } from '@angular/core';
import { ElectronService } from './services/electron/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { SHELL_MANAGER_CHANNEL } from '../../app/shared/constants/channel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('ja');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log('Run in electron');

      this.electronService.on$(SHELL_MANAGER_CHANNEL).subscribe((chunk) => {
        console.log(chunk);
      });

      this.electronService.send(SHELL_MANAGER_CHANNEL, {
        createPain: {
          id: 'test',
          size: { cols: 80, rows: 40 },
          cwd: '/',
        },
      });
    } else {
      console.log('Run in browser');
    }
  }
}
