import { AfterViewInit, Component } from '@angular/core';
import { ElectronService } from './services/electron/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { SHELL_MANAGER_CHANNEL } from '../../app/shared/constants/channel';
import { timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
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
    } else {
      console.log('Run in browser');
    }
  }

  ngAfterViewInit() {
    // 初期化後にスプラッシュ画面を削除
    const element = document.querySelector(
      '.app-initialize-remove'
    ) as HTMLElement;

    element.style.opacity = '0';
    timer(500).subscribe(() => {
      element.remove();
    });
  }
}
