import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-labels',
  templateUrl: './structure-labels.component.html',
  styleUrls: ['./structure-labels.component.scss'],
})
export class StructureLabelsComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() isEditMode: boolean;
  @Input() labelsQualifications: Category;
  @Output() validateForm = new EventEmitter<any>();
  @Output() checkChange = new EventEmitter<any>();

  async ngOnInit(): Promise<void> {
    this.validateForm.emit();
  }
  // Check if a FormControl value is in FormArray
  public isInArray(term: string, formControlName: string): boolean {
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
