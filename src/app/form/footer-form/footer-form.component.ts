import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ProfileService } from '../../profile/services/profile.service';
import { AuthService } from '../../services/auth.service';
import { NewsletterService } from '../../services/newsletter.service';
import { StructureService } from '../../services/structure.service';
import { Utils } from '../../utils/utils';
import { accountFormStep } from '../form-view/account-form/accountFormStep.enum';
import { formType } from '../form-view/formType.enum';
import { personalOfferFormStep } from '../form-view/personal-offer-form/personalOfferFormStep.enum';
import { profileFormStep } from '../form-view/profile-form/profileFormStep.enum';
import { structureFormStep } from '../form-view/structure-form/structureFormStep.enum';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-footer-form',
  templateUrl: './footer-form.component.html',
  styleUrls: ['./footer-form.component.scss'],
})
export class FooterFormComponent implements OnChanges {
  @Input() currentForm: formType;
  @Input() isValid: boolean;
  @Input() isClaimMode: boolean;
  @Input() isAccountMode: boolean;
  @Input() btnName: string[];
  @Input() nbPagesForm: number;
  @Input() form: FormGroup;
  @Input() linkedStructureId: Array<string> = null;
  @Input() acceptNewsletter: boolean;
  @Input() currentStep: accountFormStep | profileFormStep | structureFormStep | personalOfferFormStep;
  @Input() hasOtherPersonalOffer: boolean;
  @Output() goNext = new EventEmitter<any>();
  @Output() goPrev = new EventEmitter<any>();
  @Output() endPage = new EventEmitter<any>();
  @Output() endForm = new EventEmitter<any>();
  @Output() changeCurrentStep = new EventEmitter<any>();

  public isLastFormStep: boolean = false;
  public isNextFormTransition: boolean = false;
  public buttonTypeEnum = ButtonType;

  constructor(
    private authService: AuthService,
    public utils: Utils,
    private router: Router,
    private structureService: StructureService,
    private profileService: ProfileService,
    private newsletterService: NewsletterService
  ) {}
  public goToNextPage(): void {
    this.goNext.emit();
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.currentStep) {
      if (this.currentStep === accountFormStep.confirmEmailSentInfo && this.currentForm === formType.account) {
        this.isLastFormStep = true;
      }
      if (
        this.currentForm === formType.personaloffer &&
        this.currentStep === personalOfferFormStep.personalOfferFinishedInfo &&
        !this.hasOtherPersonalOffer
      ) {
        this.isNextFormTransition = true;
      }

      if (this.currentForm === formType.structure && this.currentStep === structureFormStep.mailSentInfo) {
        const user: User = await this.profileService.getProfile();
        if (!user.job.hasPersonalOffer) {
          this.isLastFormStep = true;
        }
      }
    }
  }

  public goToPreviousPage(): void {
    this.goPrev.emit();
  }

  public hasFinishButton(): boolean {
    return this.btnName.length == 3;
  }
  public finishedModal(): void {
    this.endPage.emit();
  }

  public goToHome(): void {
    this.router.navigateByUrl('news');
  }

  public prevPage(): void {
    if (this.currentForm === formType.structure && this.currentStep === structureFormStep.structureType) {
      this.changeCurrentStep.emit(structureFormStep.structureFormTime);
      return;
    }
    this.goToPreviousPage();
  }
  public async nextPage(): Promise<void> {
    if (this.currentForm === formType.account && this.currentStep === accountFormStep.accountNewsletter) {
      const user = new User(this.form.value);
      // Create user with structure
      user.structuresLink = this.linkedStructureId;
      this.authService.register(user).subscribe(() => {});
      this.newsletterService.newsletterSubscribe(user.email).subscribe(() => {});
      document.getElementsByClassName('page')[0].scrollTo(0, 0);
    }
    if (this.isProfileLastPage()) {
      this.endForm.emit({ formType: this.currentForm });
      return;
    }
    if (this.currentForm === formType.structure) {
      if (this.currentStep === structureFormStep.structureChoiceCompletion) {
        const chooseCompleteStructInfo = this.form.get('choiceCompletion').value;
        if (!chooseCompleteStructInfo) {
          this.changeCurrentStep.emit(structureFormStep.structureContactCompletion);
          return;
        }
      }
      if (this.currentStep === structureFormStep.structureFormTime) {
        this.changeCurrentStep.emit(structureFormStep.structureType);
        return;
      }
      if (this.currentStep === structureFormStep.structureContactCompletion) {
        //TODO Go to send mail page and send the mail
        return;
      }
    }
    if (this.isPersonalOfferpage()) {
      this.endForm.emit({ formType: this.currentForm });
      return;
    }
    if (this.isStructureChoiceValid()) {
      this.endForm.emit({ formType: this.currentForm, formStep: this.currentStep });
      return;
    }
    if (this.isStructureLastPage()) {
      this.endForm.emit({ formType: this.currentForm, formStep: this.currentStep });
      return;
    }
    this.goToNextPage();
  }

  private isStructureChoiceValid(): boolean {
    return (
      this.currentForm === formType.structure &&
      this.currentStep === structureFormStep.structureChoice &&
      this.form.value._id
    );
  }

  public isStructureLastPage(): boolean {
    return (
      this.currentForm === formType.structure &&
      (this.currentStep === structureFormStep.mailSentInfo ||
        this.currentStep === structureFormStep.structureCreationFinishedInfo)
    );
  }

  private isProfileLastPage(): boolean {
    return this.currentForm === formType.profile && this.currentStep === profileFormStep.profileJobSelection;
  }

  private isPersonalOfferpage(): boolean {
    return (
      this.currentForm === formType.personaloffer &&
      this.currentStep === personalOfferFormStep.personalOfferStructureChoice
    );
  }
  public isPersonalOfferFirstPage(): boolean {
    return this.currentStep === personalOfferFormStep.personalOfferAccompaniment;
  }
}
