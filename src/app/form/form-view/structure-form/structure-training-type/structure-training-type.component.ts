import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-training-type',
  templateUrl: './structure-training-type.component.html',
})
export class StructureTrainingTypeComponent {
  @Input() structureForm: FormGroup;
  @Output() validateForm = new EventEmitter<any>();

  ngOnInit(): void {
    this.validateForm.emit();
  }

  public setTrainingsFromCategories(categories: Category[]) {
    for (const categorie of categories) {
      const moduleIds: string[] = categorie.modules.map((module) => module.id);
      if (this.structureForm.get(categorie.id)) {
        this.structureForm.get(categorie.id).patchValue(moduleIds);
      }
    }
  }
}
