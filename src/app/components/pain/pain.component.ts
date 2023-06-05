/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
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
import { Subscription } from 'rxjs';
import { Pain, WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-pain',
  templateUrl: './pain.component.html',
  styleUrls: ['./pain.component.scss'],
})
export class PainComponent implements OnDestroy {
  readonly terminal = new Terminal({
    allowProposedApi: true,
  });
  readonly fitAddon = new FitAddon();
  readonly searchAddon = new SearchAddon();
  readonly webLinksAddon = new WebLinksAddon();
  readonly unicode11Addon = new Unicode11Addon();
  readonly serializeAddon = new SerializeAddon();

  private readonly subscription = new Subscription();

  constructor(
    private readonly electronService: ElectronService,
    private readonly workspaceService: WorkspaceService
  ) {}

  @Input()
  pain!: Pain;

  @Input()
  index!: number;

  @ViewChild('terminal') terminalElement!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.workspaceService.activePainIndex$.subscribe((index) => {
      if (index === this.index) {
        this.runInInit();
      }
      window.setTimeout(() => {
        this.onResize();
      }, 200);
    });
  }

  runInInit(): void {
    if (!this.terminalElement) {
      window.setTimeout(() => {
        this.runInInit();
      }, 10);
      return;
    }
    this.terminal.focus();
    this.terminalElement?.nativeElement.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }

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

    this.pain.history.forEach((history) => {
      this.terminal.write(history);
    });

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

    this.subscription.add(
      this.electronService.on$(this.pain.id).subscribe((data) => {
        if (data.output) {
          this.terminal.write(data.output);
          this.pain.history.push(data.output);
        }
      })
    );

    this.terminal.onKey(({ key, domEvent }) => {
      console.log(key, domEvent);
      if (domEvent.key === 'ArrowLeft' && domEvent.shiftKey) {
        this.workspaceService.activePainIndex$.next(this.index - 1);
        return;
      }
      if (domEvent.key === 'ArrowRight' && domEvent.shiftKey) {
        this.workspaceService.activePainIndex$.next(this.index + 1);
        return;
      }

      this.input(key);
    });

    this.subscription.add(
      this.workspaceService.activeWorkspace$.subscribe((workspace) => {
        if (this.pain.id === workspace?.id) {
          window.setTimeout(() => {
            this.onResize();
          }, 10);
        }
      })
    );
  }

  input(value: string) {
    this.electronService.send(this.pain.id, { input: value });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'KeyT' && event.metaKey) {
      this.workspaceService.createPain$(this.pain.workspaceId).subscribe(() => {
        this.workspaceService.activePainIndex$.next(
          this.workspaceService.workspacePains(this.pain.workspaceId).length - 1
        );
      });
    }
  }

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
    if (this.index !== this.workspaceService.activePainIndex$.value) {
      this.workspaceService.activePainIndex$.next(this.index);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.terminal.dispose();
  }
}
