import { ComponentRef } from '@angular/core';
import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  vcr: ViewContainerRef | undefined;

  private currentComponentRef: ComponentRef<any> | undefined;

  constructor() {}

  open(data: any) {
    if (!this.vcr) {
      throw new Error('No ViewContainerRef set!');
    }

    this.currentComponentRef = this.vcr.createComponent(data);
  }

  close() {
    console.log('ModalService.close()');
    this.currentComponentRef?.destroy();
  }
}
