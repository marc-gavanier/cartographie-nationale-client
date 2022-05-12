import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { User } from '../../../models/user.model';
import { ProfileService } from '../../../profile/services/profile.service';
import { CategoryEnum } from '../../../shared/enum/category.enum';
import { SearchService } from '../../../structure-list/services/search.service';
import { formType } from '../formType.enum';
import { structureFormStep } from './structureFormStep.enum';
import {Address, Category, Module} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-form',
  templateUrl: './structure-form.component.html',
})
export class StructureFormComponent implements OnChanges {
  @Input() nbSteps: number;
  @Input() currentStep: structureFormStep;
  @Input() structureForm: FormGroup;
  @Input() hoursForm: FormGroup;
  @Output() pageValid = new EventEmitter<any>();
  @Output() updateHoursForm = new EventEmitter<any>();
  @Output() isNotExistingStructure = new EventEmitter<any>();
  public structureFormStep = structureFormStep;
  public formTypeEnum = formType;
  public isPageValid: boolean;
  public pagesValidation = [];
  public profile: User;

  // Collapse var
  public showWebsite: boolean = false;
  public showSocialNetwork: boolean = false;
  public showPublicsAccompaniment: boolean;
  public showProceduresAccompaniment: boolean;

  // Condition form
  public isEditMode = false;
  public isWifiChoosen = null;
  public isClaimMode = false;
  public isAccountMode: boolean = false;
  public userAcceptSavedDate = false;

  // Form var
  public equipmentsAndServices: { module: Module; openned: boolean }[] = [];
  public trainingCategories: { category: Category; openned: boolean }[] = [];
  public accessModality: Category;
  public labelsQualifications: Category;
  public proceduresAccompaniment: Category;
  public publicsAccompaniment: Category;
  public publics: Category;

  constructor(private searchService: SearchService, private profileService: ProfileService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      //facultative steps
      if (
        this.currentStep === structureFormStep.structureCreationFinishedInfo ||
        this.currentStep === structureFormStep.structureHours ||
        this.currentStep === structureFormStep.structureTrainingType ||
        this.currentStep === structureFormStep.structureEquipments ||
        this.currentStep === structureFormStep.structureLabels ||
        this.currentStep === structureFormStep.structureOtherServices ||
        this.currentStep === structureFormStep.structureDescription ||
        this.currentStep === structureFormStep.structureCovidInfo ||
        this.currentStep === structureFormStep.mailSentInfo ||
        this.currentStep === structureFormStep.structureFormTime
      ) {
        this.pageValid.emit();
      }
    }
  }

  ngOnInit(): void {
    this.setCategories();
    this.profileService.getProfile().then((user: User) => {
      this.profile = user;
    });
    // if (this.isEditMode) {
    //     this.showCollapse(structure);
    //   }
  }

  public setAddressStructure(address?: Address): void {
    if (address) {
      this.structureForm.get('address').get('numero').setValue(address.numero);
      this.structureForm.get('address').get('street').setValue(address.street);
      this.structureForm.get('address').get('commune').setValue(address.commune);
    } else {
      this.structureForm.get('address').reset();
    }
    this.setValidationsForm();
  }

  public setTypeStructure(type?: string): void {
    this.structureForm.get('structureType').setValue(type);
    this.setValidationsForm();
  }

  public updateHours(form: FormGroup): void {
    this.hoursForm = form;
    this.setValidationsForm();
    this.updateHoursForm.emit(form);
  }

  public setHoursError(): void {
    this.hoursForm.setErrors({ formError: true });
    this.setValidationsForm();
  }

  public toggleWebSite(): void {
    this.showWebsite = !this.showWebsite;
    if (!this.showWebsite) {
      this.structureForm.get('website').reset();
    }
    this.setValidationsForm();
  }

  public toggleSocialNetwork(): void {
    this.showSocialNetwork = !this.showSocialNetwork;
    if (!this.showSocialNetwork) {
      this.structureForm.get('facebook').reset();
      this.structureForm.get('twitter').reset();
      this.structureForm.get('instagram').reset();
      this.structureForm.get('linkedin').reset();
    }
    this.setValidationsForm();
  }

  public setValidationsForm(): void {
    if (this.isClaimMode) {
      //TODO: check claim mode
      //   this.pagesValidation[structureFormStep.structureConsent] = { valid: this.userAcceptSavedDate };
      //   this.updatePageValid();
      // } else if (this.isAccountMode) {
      //   this.pagesValidation[structureFormStep.structureConsent] = { valid: this.userAcceptSavedDate };
      //   this.updatePageValid();
    } else {
      this.pagesValidation[structureFormStep.structureChoice] = {
        valid: this.structureForm.get('_id').valid,
        name: 'Structure existe',
      };
      this.pagesValidation[structureFormStep.structureNameAndAddress] = {
        valid: this.structureForm.get('structureName').valid && this.structureForm.get('address').valid,
        name: 'Nom et adresse',
      };
      this.pagesValidation[structureFormStep.structureContact] = {
        valid: this.structureForm.get('contactMail').valid && this.structureForm.get('contactPhone').valid,
        name: 'Contact structure',
      };
      this.pagesValidation[structureFormStep.structureAccompanimentChoice] = {
        valid: this.structureForm.get('placeOfReception').valid,
        name: 'Lieu d accueil',
      };
      this.pagesValidation[structureFormStep.structureChoiceCompletion] = {
        valid: this.structureForm.get('choiceCompletion').valid,
        name: 'Completion info structure',
      };
      this.pagesValidation[structureFormStep.structureContactCompletion] = {
        valid:
          this.structureForm.get('contactPersonFirstname').valid &&
          this.structureForm.get('contactPersonLastname').valid &&
          this.structureForm.get('contactPersonEmail').valid,
        name: 'Personne contact informations',
      };
      this.pagesValidation[structureFormStep.structureType] = {
        valid: this.structureForm.get('structureType').valid,
        name: 'Type de structure',
      };
      this.pagesValidation[structureFormStep.structureAccessModality] = {
        valid: this.structureForm.get('accessModality').valid,
        name: "Modalités d'accueil",
      };
      this.pagesValidation[structureFormStep.structureHours] = {
        valid: this.hoursForm.valid && this.structureForm.get('exceptionalClosures').valid,
        name: "Horaires d'ouverture",
      };
      this.pagesValidation[structureFormStep.structurePmr] = {
        valid: this.structureForm.get('pmrAccess').valid,
        name: 'Accessibilité pour les personnes à mobilité réduite',
      };
      this.pagesValidation[structureFormStep.structureWebAndSocialNetwork] = {
        valid:
          (this.structureForm.get('website').valid || !this.showWebsite) &&
          ((this.structureForm.get('facebook').valid &&
            this.structureForm.get('twitter').valid &&
            this.structureForm.get('instagram').valid) ||
            !this.showSocialNetwork),
        name: 'Présence sur internet',
      };
      this.pagesValidation[structureFormStep.structurePublicTarget] = {
        valid: this.structureForm.get('publics').valid,
        name: 'Public admis',
      };
      this.pagesValidation[structureFormStep.structureDigitalHelpingAccompaniment] = {
        valid: this.structureForm.get('proceduresAccompaniment').valid,
        name: 'Aides au numérique',
      };

      this.pagesValidation[structureFormStep.structureTrainingType] = {
        valid: true,
        name: 'Ateliers au numérique proposés',
      };
      this.pagesValidation[structureFormStep.structureTrainingPrice] = {
        valid: this.structureForm.get('freeWorkShop').valid,
        name: 'Gratuité des ateliers',
      };
      this.pagesValidation[structureFormStep.structureWifi] = {
        valid: this.structureForm.get('equipmentsAndServices').valid && this.isWifiChoosen !== null,
        name: 'Gratuité du wifi',
      };
      this.pagesValidation[structureFormStep.structureEquipments] = {
        valid: true,
        name: 'Equipements mis à disposition',
      };
      this.pagesValidation[structureFormStep.structureLabels] = {
        valid: true,
        name: 'Labélisations proposées',
      };
      this.pagesValidation[structureFormStep.structureOtherServices] = {
        valid: this.structureForm.get('equipmentsAndServices').valid,
        name: 'Autres services proposés',
      };
      this.pagesValidation[structureFormStep.structureDescription] = {
        valid: true,
        name: 'Présentation de la structure',
      };
      this.pagesValidation[structureFormStep.structureCovidInfo] = {
        valid: true,
        name: 'Informations spécifiques à la période COVID',
      };
      if (this.isEditMode) {
        this.pagesValidation[structureFormStep.structureConsent] = {
          valid: this.structureForm.get('dataShareConsentDate').valid,
          name: 'Partage de données sur data.grandlyon.com',
        };
      } else {
        this.pagesValidation[structureFormStep.structureConsent] = { valid: this.userAcceptSavedDate };
      }
      this.updatePageValid();
    }
  }

  async setCategories(): Promise<void> {
    this.searchService.getCategoriesAccompaniment().subscribe((categories: Category[]) => {
      this.proceduresAccompaniment = categories[0];
    });
    const equipmentsCategs = await this.searchService.getCategoriesOthers().toPromise();
    equipmentsCategs.forEach((categ) => {
      switch (categ.id) {
        case CategoryEnum.accessModality: {
          this.accessModality = categ;
          break;
        }
        case CategoryEnum.equipmentsAndServices: {
          categ.modules.forEach((c) => {
            this.equipmentsAndServices.push({ module: c, openned: false });
          });
          break;
        }
        case CategoryEnum.labelsQualifications: {
          this.labelsQualifications = categ;
          break;
        }
        case CategoryEnum.publics: {
          this.publics = categ;
          break;
        }
        case CategoryEnum.publicsAccompaniment: {
          this.publicsAccompaniment = categ;
          break;
        }
      }
    });
    const categs = await this.searchService.getCategoriesTraining().toPromise();
    categs.forEach((categ) => {
      this.trainingCategories.push({ category: categ, openned: false });
    });
  }

  public onCheckChange({
    event,
    formControlName,
    value,
  }: {
    event: boolean;
    formControlName: string;
    value: string;
  }): void {
    if (value === 'wifiEnAccesLibre') {
      this.isWifiChoosen = event;
    }
    const formArray: FormArray = this.structureForm.get(formControlName) as FormArray;
    if (event) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(value));
    } else {
      // Remove uncheck control in the arrayForm
      const index = formArray.controls.findIndex((element) => element.value === value);
      formArray.removeAt(index);
    }
    this.setValidationsForm();
  }

  public updateChoice({ formControlName, choice }: { formControlName: string; choice: string }): void {
    const event = !this.isInArray({ formControlName, term: choice });
    this.onCheckChange({ event, formControlName, value: choice });
  }

  // Check if a FormControl value is in FormArray
  public isInArray({ formControlName, term }: { formControlName: string; term: string }): boolean {
    if (this.structureForm.controls[formControlName] && this.structureForm.controls[formControlName].value) {
      return this.structureForm.controls[formControlName].value.includes(term);
    }
    return false;
  }

  public onRadioChange(nameAndEvent: { name: string; value: boolean }): void {
    const { name, value } = nameAndEvent;
    this.structureForm.get(name).setValue(value);
    this.setValidationsForm();
  }

  /**
   * Update valid page or return page validity of the given index
   * @param {number} [index] - Page index
   */
  private updatePageValid(index?: number): boolean {
    if (index) {
      return this.pagesValidation[index].valid;
    }
    this.isPageValid = this.pagesValidation[this.currentStep].valid;
    if (this.isPageValid) {
      this.pageValid.emit();
    } else {
      this.pageValid.emit(false);
    }
    return this.isPageValid;
  }

  public getStructureControl(nameControl: string): AbstractControl {
    return this.structureForm.get(nameControl);
  }
  public acceptDataBeSaved(isAccepted: boolean): void {
    this.userAcceptSavedDate = isAccepted;
    this.setValidationsForm();
  }
  public acceptOpenData(isAccepted: boolean): void {
    let now = isAccepted ? new Date().toString() : '';
    this.getStructureControl('dataShareConsentDate').setValue(now);
    this.setValidationsForm();
  }

  public goToCreateStructure(structureName = ''): void {
    this.structureForm.patchValue({ _id: null, structureName });
    this.isNotExistingStructure.emit();
  }
}
