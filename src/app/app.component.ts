import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { SHELL_MANAGER_CHANNEL } from '../../app/shared/constants/channel';
import { chunkToString } from '../../app/shared/chunk';

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
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);

      this.electronService.ipcRenderer.on('test', (event, data) => {
        console.log(data);
      });
      this.electronService.ipcRenderer.send(
        SHELL_MANAGER_CHANNEL,
        chunkToString({
          createPain: {
            id: 'test',
            size: { cols: 80, rows: 40 },
            cwd: '/',
          },
        })
      );
      console.log('chunk');
    } else {
      console.log('Run in browser');
    }
  }
}
