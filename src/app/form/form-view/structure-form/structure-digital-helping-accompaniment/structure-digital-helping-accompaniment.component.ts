import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-digital-helping-accompaniment',
  templateUrl: './structure-digital-helping-accompaniment.component.html',
})
export class StructureDigitalHelpingAccompanimentComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() proceduresAccompaniment: Category;
  @Output() updateChoice = new EventEmitter<any>();
  @Output() validateForm = new EventEmitter<any>();

  public buttonTypeEnum = ButtonType;

  ngOnInit(): void {
    this.validateForm.emit();
  }

  public updateChoiceAccompaniment(choice: string) {
    this.updateChoice.emit({ formControlName: 'proceduresAccompaniment', choice });
  }

  public isInArray(choice: string) {
    if (
      this.structureForm.get('proceduresAccompaniment') &&
      this.structureForm.get('proceduresAccompaniment').value.includes(choice)
    )
      return true;
    return false;
  }
}
