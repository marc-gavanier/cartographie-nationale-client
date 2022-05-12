import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-modal-confirmation',
  templateUrl: './modal-confirmation.component.html',
  styleUrls: ['./modal-confirmation.component.scss'],
})
export class ModalConfirmationComponent {
  @Input() public openned: boolean;
  @Input() public content: string;
  @Input() public customConfirmationText?: string;
  @Output() closed = new EventEmitter<boolean>();
  public buttonTypeEnum = ButtonType;

  public closeModal(value: boolean): void {
    this.closed.emit(value);
  }
}
