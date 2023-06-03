import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit {
  @ViewChild('modalInner', { read: ViewContainerRef }) vcr: any;

  isOpen = this.modalService.isOpen;

  constructor(private modalService: ModalService) {}

  ngAfterViewInit() {
    this.modalService.vcr = this.vcr;
  }
}
