import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { ElectronService } from '../../services/electron/electron.service';
import { SHELL_MANAGER_CHANNEL } from '../../../../app/shared/constants/channel';

interface Pain {
  id: string;
  cwd: string;
}

@Component({
  selector: 'app-pain',
  templateUrl: './pain.component.html',
  styleUrls: ['./pain.component.scss'],
})
export class PainComponent {
  readonly terminal = new Terminal({
    allowProposedApi: true,
  });
  readonly fitAddon = new FitAddon();
  readonly searchAddon = new SearchAddon();
  readonly webLinksAddon = new WebLinksAddon();
  readonly unicode11Addon = new Unicode11Addon();
  readonly serializeAddon = new SerializeAddon();

  constructor(private readonly electronService: ElectronService) {}

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input()
  pain: Pain = {
    id: Math.random().toString(36).substr(2, 9),
    cwd: this.electronService.homeDir,
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('terminal') terminalElement!: ElementRef<HTMLDivElement>;

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit(): void {
    console.log('Create pain:', this.pain.id);
    [
      this.fitAddon,
      this.searchAddon,
      this.webLinksAddon,
      this.unicode11Addon,
      this.serializeAddon,
    ].map((addon) => this.terminal.loadAddon(addon));

    this.terminal.open(this.terminalElement.nativeElement);
    this.fitAddon.fit();

    this.electronService.send(SHELL_MANAGER_CHANNEL, {
      createPain: {
        id: this.pain.id,
        size: {
          cols: this.terminal.cols,
          rows: this.terminal.rows,
        },
        cwd: this.pain.cwd,
      },
    });

    this.electronService.on$(this.pain.id).subscribe((data) => {
      if (data.output) {
        this.terminal.write(data.output);
      }
    });

    this.terminal.onKey(({ key, domEvent }) => {
      console.log(key, domEvent);
      if (domEvent.key === 'ArrowLeft' && domEvent.shiftKey) {
        // this.windowService.changeActivePain('prev');
        return;
      }
      if (domEvent.key === 'ArrowRight' && domEvent.shiftKey) {
        // this.windowService.changeActivePain('next');
        return;
      }

      this.input(key);
    });
  }

  input(value: string) {
    this.electronService.send(this.pain.id, { input: value });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.fitAddon.fit();
    this.electronService.send(this.pain.id, {
      resize: {
        cols: this.terminal.cols,
        rows: this.terminal.rows,
      },
    });
  }

  onClick() {
    // if (this.windowService.activePainId$.value !== this.pain.id) {
    //   this.windowService.activePainId$.next(this.pain.id);
    // }
  }
}
