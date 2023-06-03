import { ComponentRef } from '@angular/core';
import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  vcr: ViewContainerRef | undefined;
  isOpen = false;

  private currentComponentRef: ComponentRef<any> | undefined;

  constructor() {}

  open(data: any) {
    if (this.isOpen) {
      return;
    }
    if (!this.vcr) {
      throw new Error('No ViewContainerRef set!');
    }

    this.currentComponentRef = this.vcr.createComponent(data);
    this.isOpen = true;
  }

  close() {
    console.log('ModalService.close()');
    this.currentComponentRef?.destroy();
    this.isOpen = false;
  }
}
