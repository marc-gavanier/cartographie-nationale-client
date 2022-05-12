import { Component, EventEmitter, Input, Output } from '@angular/core';
import { accountFormStep } from '../../account-form/accountFormStep.enum';
import { formType } from '../../formType.enum';
import { personalOfferFormStep } from '../../personal-offer-form/personalOfferFormStep.enum';
import { profileFormStep } from '../../profile-form/profileFormStep.enum';
import { structureFormStep } from '../../structure-form/structureFormStep.enum';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-information-step',
  templateUrl: './information-step.component.html',
  styleUrls: ['./information-step.component.scss'],
})
export class InformationStepComponent {
  @Input() step: number;
  @Input() formType: formType;
  @Input() structureName?: string;
  @Input() hasPersonalOffer?: boolean;
  @Output() goNext = new EventEmitter<any>();

  public formTypeEnum = formType;
  public accountFormStepEnum = accountFormStep;
  public profileFormStepEnum = profileFormStep;
  public structureFormStepEnum = structureFormStep;
  public personalOfferFormStep = personalOfferFormStep;
  public buttonTypeEnum = ButtonType;

  public nextPage(): void {
    this.goNext.emit();
  }
}
