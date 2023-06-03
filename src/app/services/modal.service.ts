/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { ComponentRef } from '@angular/core';
import { Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  vcr: ViewContainerRef | undefined;
  isOpen$ = new BehaviorSubject<boolean>(false);

  private currentComponentRef: ComponentRef<any> | undefined;

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
    console.log('ModalService.close()');
    this.currentComponentRef?.destroy();
    this.currentComponentRef = undefined;
    this.isOpen$.next(false);
  }
}
