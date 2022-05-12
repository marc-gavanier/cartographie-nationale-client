import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-access-modality',
  templateUrl: './structure-access-modality.component.html',
})
export class StructureAccessModalityComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() accessModality: Category;
  @Output() checkChange = new EventEmitter<any>();
  @Output() validateForm = new EventEmitter<any>();

  ngOnInit(): void {
    this.validateForm.emit();
  }

  public onCheckChange(event: boolean, formControlName: string, modality: string) {
    this.checkChange.emit({
      event,
      formControlName,
      value: modality,
    });
  }

  public isInArray(formControlName: string, term: string) {
    if (this.structureForm.controls[formControlName].value) {
      return this.structureForm.controls[formControlName].value.includes(term);
    }
    return false;
  }
}
