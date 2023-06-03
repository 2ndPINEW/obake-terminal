/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { ComponentRef } from '@angular/core';
import { Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  vcr: ViewContainerRef | undefined;
  isOpen$ = new BehaviorSubject<boolean>(false);

  private currentComponentRef: ComponentRef<any> | undefined;

  constructor(private workspaceService: WorkspaceService) {}

  open(data: any) {
    if (this.isOpen$.value) {
      return;
    }
    if (!this.vcr) {
      throw new Error('No ViewContainerRef set!');
    }

    this.currentComponentRef = this.vcr.createComponent(data);
    this.isOpen$.next(true);
  }

  close() {
    if (!this.isOpen$.value) {
      return;
    }
    this.currentComponentRef?.destroy();
    this.currentComponentRef = undefined;
    this.isOpen$.next(false);

    // 閉じた時にターミナルにフォーカスを戻したい
    this.workspaceService.activePainIndex$.next(
      this.workspaceService.activePainIndex$.value
    );
  }

  openOrClose(data: any) {
    if (this.isOpen$.value) {
      this.close();
    } else {
      this.open(data);
    }
  }
}
