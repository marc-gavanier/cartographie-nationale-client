import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-other-services',
  templateUrl: './structure-other-services.component.html',
})
export class StructureOtherServicesComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() isEditMode: boolean;
  @Input() equipmentsAndServices: Category;
  @Output() validateForm = new EventEmitter<any>();
  @Output() checkChange = new EventEmitter<any>();

  async ngOnInit(): Promise<void> {
    this.validateForm.emit();
  }

  public isInArray(formControlName: string, term: string) {
    if (this.structureForm.controls[formControlName].value) {
      return this.structureForm.controls[formControlName].value.includes(term);
    }
    return false;
  }

  public onCheckChange(event: boolean, formControlName: string, modality: string) {
    this.checkChange.emit({
      event,
      formControlName,
      value: modality,
    });
  }
}
