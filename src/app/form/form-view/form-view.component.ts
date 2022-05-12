import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StructureWithOwners } from '../../models/structureWithOwners.model';
import { User } from '../../models/user.model';
import { ProfileService } from '../../profile/services/profile.service';
import { PersonalOfferService } from '../../services/personal-offer.service';
import { StructureService } from '../../services/structure.service';
import { MustMatch } from '../../shared/validator/form';
import { CustomRegExp } from '../../utils/CustomRegExp';
import { accountFormStep } from './account-form/accountFormStep.enum';
import { formType } from './formType.enum';
import { personalOfferFormStep } from './personal-offer-form/personalOfferFormStep.enum';
import { profileFormStep } from './profile-form/profileFormStep.enum';
import { structureFormStep } from './structure-form/structureFormStep.enum';
import {Day, PersonalOffer, Structure, Time} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
})
export class FormViewComponent implements OnInit {
  public routeParam: string;
  public formType = formType;
  public currentPage: accountFormStep | profileFormStep | structureFormStep | personalOfferFormStep;
  public currentFormType: formType;
  public currentForm: FormGroup;

  // Account Form
  public accountForm: FormGroup;
  public userAcceptNewsletter: boolean;
  // Profile Form
  public profileForm: FormGroup;
  public isPersonalOfferProfile: boolean;

  // Structure from
  public structureForm: FormGroup;
  public editForm: FormGroup;
  public structure: Structure;
  public isEditMode: boolean = false;
  public structureFormStep = structureFormStep;

  // Personal Offers Form
  public personalOfferForm: FormGroup;
  public hasOtherPersonalOffer: boolean = false;

  // Page and progress var
  public pagesValidation = [];
  public nbSteps: number;

  // Condition form
  public userAcceptSavedDate = false;

  // Collapse var
  public showWebsite: boolean;
  public showSocialNetwork: boolean;

  public profile: User;
  public isAccountMode: boolean = false;
  public isClaimMode: boolean = false;
  public isJoinMode: boolean = false;
  public claimStructure: boolean = false;
  public isWifiChoosen: boolean;
  public linkedStructureId;
  public structureWithOwners: StructureWithOwners;
  public isPageValid: boolean = false;
  public hoursForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private structureService: StructureService,
    private personalOfferService: PersonalOfferService
  ) {}

  async ngOnInit(): Promise<void> {
    this.routeParam = this.router.routerState.snapshot.url.split('/')[2];

    this.initPage();
    this.profileService.getProfile().then((user: User) => {
      this.profile = user;
    });
    // Check if it's a new structure or edit structure
    // this.isLoading = false;
    if (history.state.newUser) {
      this.isClaimMode = true;
      // Handle join structure, the case is very similar to claim
      if (history.state.isJoin) {
        this.isJoinMode = true;
      }
      this.createAccountForm();
      this.claimStructure = history.state.newUser;
    }
    // Handle account creation when pre-register
    this.route.data.subscribe((data) => {
      if (data.user) {
        this.isAccountMode = true;
        this.createAccountForm(data.user.email);
        this.linkedStructureId = data.user.pendingStructuresLink;
        this.currentPage = accountFormStep.accountInfo;
      }
      //TODO: Edit mode
      // if (data.structure) {
      //   this.isEditMode = true;
      //   this.isWifiChoosen = true;
      //   const editStructure = new Structure(data.structure);
      //   this.initForm(editStructure);
      //   this.structureService.getStructureWithOwners(editStructure._id, this.profile).subscribe((s) => {
      //     this.structureWithOwners = s;
      //   });
      // }
    });

    this.route.data.subscribe((data) => {
      if (data.user) {
        this.isAccountMode = true;
      }
      if (data.structure) {
        this.isEditMode = true;
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      this.routeParam = this.router.routerState.snapshot.url.split('/')[2];

      this.initPage();
    });
  }

  private initPage(): void {
    if (formType[this.routeParam] === formType.account) {
      this.nbSteps = 3;
      this.currentPage = accountFormStep.accountInfo;
      this.currentFormType = formType.account;
      this.createAccountForm();
      this.currentForm = this.accountForm;
    }
    if (formType[this.routeParam] === formType.profile) {
      this.nbSteps = Object.keys(profileFormStep).length / 2;
      this.currentPage = profileFormStep.profileBeginningInfo;
      this.currentFormType = formType.profile;
      this.createProfileForm();
      this.currentForm = this.profileForm;
    }
    if (formType[this.routeParam] === formType.structure) {
      this.nbSteps = 24;
      this.currentPage = structureFormStep.structureChoice;
      this.currentFormType = formType.structure;
      this.structure = new Structure();
      this.createStructureForm(this.structure);
      this.currentForm = this.structureForm;
      //TODO: Edit mode
      // if (this.isEditMode) {
      //   this.editForm = this.createStructureForm(structure);
      // }

      // Init hours form
      this.hoursForm = new FormGroup({
        monday: this.createDay(this.structure.hours.monday),
        tuesday: this.createDay(this.structure.hours.tuesday),
        wednesday: this.createDay(this.structure.hours.wednesday),
        thursday: this.createDay(this.structure.hours.thursday),
        friday: this.createDay(this.structure.hours.friday),
        saturday: this.createDay(this.structure.hours.saturday),
        sunday: this.createDay(this.structure.hours.sunday),
      });
    }
    if (formType[this.routeParam] === formType.personaloffer) {
      this.nbSteps = 3;
      this.currentPage = personalOfferFormStep.personalOfferAccompaniment;
      this.currentFormType = formType.personaloffer;
      const newPersonalOffer: PersonalOffer = new PersonalOffer();
      this.createPersonalOfferForm(newPersonalOffer);
      this.currentForm = this.personalOfferForm;
    }
  }

  public updateHours(form: FormGroup): void {
    this.hoursForm = form;
  }

  private createDay(day: Day): FormGroup {
    return new FormGroup({
      open: new FormControl(day.open, Validators.required),
      time: new FormArray(day.time.map((oneTime) => this.createTime(oneTime))) as FormArray,
    });
  }
  private createTime(time: Time): FormGroup {
    return new FormGroup({
      opening: new FormControl(time.opening),
      closing: new FormControl(time.closing),
    });
  }

  private createAccountForm(email?: string): void {
    this.accountForm = new FormGroup(
      {
        email: new FormControl(email ? email : '', [Validators.required, Validators.pattern(CustomRegExp.EMAIL)]),
        name: new FormControl('', [Validators.required, Validators.pattern(CustomRegExp.TEXT_WITHOUT_NUMBER)]),
        surname: new FormControl('', [Validators.required, Validators.pattern(CustomRegExp.TEXT_WITHOUT_NUMBER)]),
        phone: new FormControl('', [Validators.required, Validators.pattern(CustomRegExp.PHONE)]),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(CustomRegExp.PASSWORD), //NOSONAR
        ]),
        confirmPassword: new FormControl(''),
      },
      [MustMatch('password', 'confirmPassword')]
    );
  }

  private createProfileForm(): void {
    this.profileForm = new FormGroup({
      employer: new FormGroup({
        name: new FormControl('', [Validators.required]),
        validated: new FormControl(false, [Validators.required]),
      }),
      job: new FormGroup({
        name: new FormControl('', [Validators.required]),
        validated: new FormControl(true, [Validators.required]),
        hasPersonalOffer: new FormControl(true, [Validators.required]),
      }),
      structure: new FormControl('', [Validators.required]),
    });
  }

  private createStructureForm(structure): void {
    this.structureForm = new FormGroup({
      _id: new FormControl(structure._id),
      coord: new FormControl(structure.coord),
      structureType: new FormControl(structure.structureType, Validators.required),
      structureName: new FormControl(structure.structureName, Validators.required),
      description: new FormControl(structure.description),
      lockdownActivity: new FormControl(structure.lockdownActivity),
      address: new FormGroup({
        numero: new FormControl(structure.address.numero),
        street: new FormControl(structure.address.street, Validators.required),
        commune: new FormControl(structure.address.commune, Validators.required),
      }),
      contactMail: new FormControl(structure.contactMail, [
        Validators.required,
        Validators.pattern(CustomRegExp.EMAIL),
      ]),
      contactPhone: new FormControl(structure.contactPhone, [
        Validators.required,
        Validators.pattern(CustomRegExp.PHONE),
      ]),
      contactPersonFirstname: new FormControl(structure.contactPersonLastname, Validators.required),
      contactPersonLastname: new FormControl(structure.contactPersonLastname, Validators.required),
      contactPersonEmail: new FormControl(structure.contactPersonEmail, [
        Validators.pattern(CustomRegExp.EMAIL),
        Validators.required,
      ]),
      website: new FormControl(structure.website, Validators.pattern(CustomRegExp.WEBSITE)),
      facebook: new FormControl(structure.facebook, Validators.pattern(CustomRegExp.FACEBOOK)),
      twitter: new FormControl(structure.twitter, Validators.pattern(CustomRegExp.TWITTER)),
      instagram: new FormControl(structure.instagram, Validators.pattern(CustomRegExp.INSTAGRAM)),
      linkedin: new FormControl(structure.linkedin, Validators.pattern(CustomRegExp.LINKEDIN)),
      hours: new FormGroup({}),
      pmrAccess: new FormControl(structure.pmrAccess, Validators.required),
      placeOfReception: new FormControl(structure.placeOfReception, Validators.required),
      choiceCompletion: new FormControl(structure.choiceCompletion, Validators.required),
      exceptionalClosures: new FormControl(structure.exceptionalClosures),
      labelsQualifications: this.loadArrayForCheckbox(structure.labelsQualifications, false),
      accessModality: this.loadArrayForCheckbox(structure.accessModality, true),
      publicsAccompaniment: this.loadArrayForCheckbox(structure.publicsAccompaniment, false),
      proceduresAccompaniment: this.loadArrayForCheckbox(structure.proceduresAccompaniment, false),
      //TODO: remettre ou migrer les données de accompagnements à distance
      remoteAccompaniment: new FormControl(false),
      otherDescription: new FormControl(structure.otherDescription),
      equipmentsAndServices: this.loadArrayForCheckbox(structure.equipmentsAndServices, false),
      publics: this.loadArrayForCheckbox(structure.publics, true),
      baseSkills: new FormControl(structure.baseSkills),
      accessRight: new FormControl(structure.accessRight),
      parentingHelp: new FormControl(structure.parentingHelp),
      socialAndProfessional: new FormControl(structure.socialAndProfessional),
      digitalCultureSecurity: new FormControl(structure.digitalCultureSecurity),
      nbComputers: new FormControl(
        structure.equipmentsAndServices.includes('ordinateurs') ? structure.nbComputers : 0,
        [Validators.required, Validators.pattern(CustomRegExp.NO_NEGATIVE_NUMBER), Validators.min(0)]
      ),
      nbPrinters: new FormControl(structure.equipmentsAndServices.includes('imprimantes') ? structure.nbPrinters : 0, [
        Validators.required,
        Validators.pattern(CustomRegExp.NO_NEGATIVE_NUMBER),
        Validators.min(0),
      ]),
      nbTablets: new FormControl(structure.equipmentsAndServices.includes('tablettes') ? structure.nbTablets : 0, [
        Validators.required,
        Validators.pattern(CustomRegExp.NO_NEGATIVE_NUMBER),
        Validators.min(0),
      ]),
      nbNumericTerminal: new FormControl(
        structure.equipmentsAndServices.includes('bornesNumeriques') ? structure.nbNumericTerminal : 0,
        [Validators.required, Validators.pattern(CustomRegExp.NO_NEGATIVE_NUMBER), Validators.min(0)]
      ),
      nbScanners: new FormControl(structure.equipmentsAndServices.includes('scanners') ? structure.nbScanners : 0, [
        Validators.required,
        Validators.pattern(CustomRegExp.NO_NEGATIVE_NUMBER),
        Validators.min(0),
      ]),
      freeWorkShop: new FormControl(structure.freeWorkShop, [Validators.required]),
      dataShareConsentDate: new FormControl(structure.dataShareConsentDate),
      personalOffers: new FormControl(structure.personalOffers),
    });
  }
  public acceptReceiveNewsletter(isAccepted: boolean): void {
    this.userAcceptNewsletter = isAccepted;
  }
  private createPersonalOfferForm(personalOffer: PersonalOffer): void {
    this.personalOfferForm = new FormGroup({
      publicsAccompaniment: new FormControl(personalOffer.publicsAccompaniment),
      proceduresAccompaniment: new FormControl(personalOffer.proceduresAccompaniment),
      baseSkills: new FormControl(personalOffer.baseSkills),
      accessRight: new FormControl(personalOffer.accessRight),
      digitalCultureSecurity: new FormControl(personalOffer.digitalCultureSecurity),
      socialAndProfessional: new FormControl(personalOffer.socialAndProfessional),
      parentingHelp: new FormControl(personalOffer.parentingHelp),
    });
  }

  private loadArrayForCheckbox(array: string[], isRequired: boolean): FormArray {
    return new FormArray(
      array.map((str) => new FormControl(str)),
      isRequired ? Validators.required : Validators.nullValidator
    );
  }
  public validatePage(value: boolean = true): void {
    this.isPageValid = value;
  }

  public nextPage(): void {
    this.isPageValid = false;
    if (this.currentPage < this.nbSteps) {
      this.currentPage++;
    }
  }
  public prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  public displayFooterForm(): boolean {
    if (this.currentPage === profileFormStep.profileBeginningInfo && formType[this.routeParam] === formType.profile)
      return false;
    return true;
  }

  public setHasOtherPersonalOffer(value: boolean): void {
    this.hasOtherPersonalOffer = value;
  }

  public linkStructureToUser(): void {
    this.structureService.joinStructure(this.structureForm.value._id, this.profile.email).subscribe((data) => {
      this.currentPage = structureFormStep.mailSentInfo;
      this.nbSteps = structureFormStep.mailSentInfo;
      this.structure._id = this.structureForm.value._id;
      this.structure.structureName = this.structureForm.value.structureName;
    });
  }

  public async endForm(type: {
    formType: formType;
    formStep?: accountFormStep | profileFormStep | structureFormStep | personalOfferFormStep;
  }): Promise<void> {
    switch (type.formType) {
      case formType.account:
        break;
      case formType.profile:
        this.saveProfileForm();
        break;
      case formType.structure:
        if (type.formStep === structureFormStep.mailSentInfo) {
          const user = await this.profileService.getProfile();
          if (user.job.hasPersonalOffer) {
            this.router.navigateByUrl('form/personaloffer');
          } else {
            this.router.navigateByUrl('/');
          }
        }
        if (type.formStep === structureFormStep.structureChoice) {
          // If structure already exist, join it.
          // On first strike the structure._id is not set and is a key to differentiate with other case
          if (this.structureForm.value._id && !this.structure._id) {
            this.linkStructureToUser();
          }
        }
        if (type.formStep === structureFormStep.structureCreationFinishedInfo) {
          this.saveStructureForm();
        }
        break;
      case formType.personaloffer:
        this.savePersonalOfferForm();
        break;
    }
  }

  public saveProfileForm(): void {
    forkJoin({
      employer: this.profileService.createEmployer(this.profileForm.get('employer').value).pipe(
        map((res) => res),
        catchError((e) => of(this.profileForm.get('employer').value))
      ),
      job: this.profileService.createJob(this.profileForm.get('job').value).pipe(
        map((res) => res),
        catchError((e) => of(this.profileForm.get('job').value))
      ),
      profile: this.profileService
        .updateProfile(this.profileForm.get('employer').value.name, this.profileForm.get('job').value.name)
        .pipe(
          map((res) => res),
          catchError((e) => of())
        ),
    }).subscribe(() => {
      this.router.navigateByUrl('form/structure');
    });
  }

  public savePersonalOfferForm(): void {
    this.personalOfferService.createPersonalOffer(this.structure._id, this.personalOfferForm.value).subscribe(() => {
      if (this.hasOtherPersonalOffer) {
        this.router.navigateByUrl('form/structure');
      } else {
        this.nextPage();
      }
    });
  }
  public async saveStructureForm(): Promise<void> {
    const user = await this.profileService.getProfile();
    this.structureService.createStructure(this.structureForm.value, this.profile).subscribe((struct) => {
      if (user.job.hasPersonalOffer) {
        this.structure = struct;
        this.router.navigateByUrl('form/personaloffer');
      } else {
        this.router.navigateByUrl(`acteurs?id=${struct._id}`);
      }
    });
  }
  public setCurrentStep(step: accountFormStep | profileFormStep | structureFormStep | personalOfferFormStep): void {
    this.currentPage = step;
  }
}
