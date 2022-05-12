import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-personal-offer-training-type',
  templateUrl: './personal-offer-training-type.component.html',
  styleUrls: ['./personal-offer-training-type.component.scss'],
})
export class PersonalOfferTrainingTypeComponent {
  @Input() structureName: string;
  @Input() personalOfferForm: FormGroup;

  public setTrainingsFromCategories(categories: Category[]) {
    for (const categorie of categories) {
      const moduleIds: string[] = categorie.modules.map((module) => module.id);
      if (this.personalOfferForm.get(categorie.id)) {
        this.personalOfferForm.get(categorie.id).patchValue(moduleIds);
      }
    }
  }
}
