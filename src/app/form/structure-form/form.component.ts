import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { StructureService } from '../../services/structure.service';
import { SearchService } from '../../structure-list/services/search.service';
import { CategoryEnum } from '../../shared/enum/category.enum';
import { ProfileService } from '../../profile/services/profile.service';
import { User } from '../../models/user.model';
import { MustMatch } from '../../shared/validator/form';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { PageTypeEnum } from './pageType.enum';
import { CustomRegExp } from '../../utils/CustomRegExp';
import { StructureWithOwners } from '../../models/structureWithOwners.model';
import { RouterListenerService } from '../../services/routerListener.service';
import { NewsletterService } from '../../services/newsletter.service';
import { Utils } from '../../utils/utils';
import {Address, Category, Day, Equipment, Module, Structure, Time} from '@gouvfr-anct/mediation-numerique';

//TODO: Delete whole component when form refacto is done
@Component({
  selector: 'app-structure-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  public profile: User;
  public createdStructure: Structure;
  // Form var
  public structureForm: FormGroup;
  public accountForm: FormGroup;
  public hoursForm: FormGroup;
  public editForm: FormGroup;
  public labelsQualifications: Category;
  public publics: Category;
  public accessModality: Category;
  public publicsAccompaniment: Category;
  public proceduresAccompaniment: Category;
  public equipmentsAndServices: { module: Module; openned: boolean }[] = [];
  public trainingCategories: { category: Category; openned: boolean }[] = [];
  public pageTypeEnum = PageTypeEnum;
  public claimStructure: Structure = null;
  public linkedStructureId: Array<string> = null;

  // Page and progress var
  public currentPage = 0; // Change this value to start on a different page for dev testing
  public progressStatus = 0;
  public nbPagesForm = 24;
  public isPageValid: boolean;
  public pagesValidation = [];

  // Collapse var
  public showWebsite: boolean;
  public showSocialNetwork: boolean;
  public showPublicsAccompaniment: boolean;
  public showProceduresAccompaniment: boolean;

  // ModalExit var
  public showConfirmationModal = false;
  private resolve: Function;

  // Condition form
  public isShowConfirmPassword = false;
  public isShowPassword = false;
  public userAcceptSavedDate = false;
  public userAcceptNewsletter = false;
  public showMenu = false;
  public isEditMode = false;
  public isClaimMode = false;
  public isAccountMode = false;
  public isJoinMode = false;
  public isLoading = false;
  public isWifiChoosen = null;
  public structureWithOwners: StructureWithOwners;

  public isPopUpOpen = false;
  public displaySignUp = true;

  // Structure id for edit mode
  public structureId: string;
  // last page for edit form
  public lastPage = this.pageTypeEnum.cgu;

  constructor(
    private structureService: StructureService,
    private searchService: SearchService,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private routerListener: RouterListenerService,
    private newsletterService: NewsletterService,
    public utils: Utils
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    this.profileService.getProfile().then((user: User) => {
      this.profile = user;
    });
    await this.setCategories();
    // Check if it's a new structure or edit structure
    this.isLoading = false;
    if (history.state.newUser) {
      this.isClaimMode = true;
      // Handle join structure, the case is very similar to claim
      if (history.state.isJoin) {
        this.isJoinMode = true;
      }
      this.createAccountForm();
      this.claimStructure = history.state.newUser;
      this.setValidationsForm();
    } else {
      this.initForm(new Structure());
    }
    // Handle account creation when pre-register
    this.route.data.subscribe((data) => {
      if (data.user) {
        this.isAccountMode = true;
        this.createAccountForm(data.user.email);
        this.linkedStructureId = data.user.pendingStructuresLink;
        this.setValidationsForm();
        this.currentPage = PageTypeEnum.accountInfo;
      }
      if (data.structure) {
        this.isEditMode = true;
        this.isWifiChoosen = true;
        const editStructure = new Structure(data.structure);
        this.initForm(editStructure);
        this.structureService.getStructureWithOwners(editStructure._id, this.profile).subscribe((s) => {
          this.structureWithOwners = s;
        });
      }
    });
  }

  public previousUrl(): void {
    if (this.claimStructure) {
      this.routerListener.goToPreviousUrl(this.claimStructure);
    } else if (this.editForm) {
      this.routerListener.goToPreviousUrl(this.editForm.value);
    } else {
      this.routerListener.goToPreviousUrl();
    }
  }

  public closeSignUpModal(value: boolean): void {
    if (!value) {
      this.displaySignUp = false;
    } else {
      this.isPopUpOpen = false;
    }
    if (this.isLoggedIn) {
      this.updateFormOnLogin();
    }
  }

  public updateFormOnLogin(): void {
    this.profileService.getProfile().then((user: User) => {
      this.profile = user;
      this.router.navigateByUrl('create-structure');
      this.progressStatus += (100 / this.nbPagesForm) * 2;
      this.pagesValidation[PageTypeEnum.accountInfo] = { valid: true };
      this.pagesValidation[PageTypeEnum.accountCredentials] = { valid: true };
      this.currentPage = PageTypeEnum.structureNameAndAddress;
    });
  }

  public get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
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

  private initForm(structure: Structure): void {
    // Init account Form
    this.createAccountForm();

    // Init form
    this.structureForm = this.createStructureForm(structure);
    if (this.isEditMode) {
      this.editForm = this.createStructureForm(structure);
    }

    // Init hours form
    this.hoursForm = new FormGroup({
      monday: this.createDay(structure.hours.monday),
      tuesday: this.createDay(structure.hours.tuesday),
      wednesday: this.createDay(structure.hours.wednesday),
      thursday: this.createDay(structure.hours.thursday),
      friday: this.createDay(structure.hours.friday),
      saturday: this.createDay(structure.hours.saturday),
      sunday: this.createDay(structure.hours.sunday),
    });
    if (this.isEditMode) {
      this.showCollapse(structure);
    }

    this.setValidationsForm();
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

  private createStructureForm(structure): FormGroup {
    return new FormGroup({
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
      website: new FormControl(structure.website, Validators.pattern(CustomRegExp.WEBSITE)),
      facebook: new FormControl(structure.facebook, Validators.pattern(CustomRegExp.FACEBOOK)),
      twitter: new FormControl(structure.twitter, Validators.pattern(CustomRegExp.TWITTER)),
      instagram: new FormControl(structure.instagram, Validators.pattern(CustomRegExp.INSTAGRAM)),
      linkedin: new FormControl(structure.linkedin, Validators.pattern(CustomRegExp.LINKEDIN)),
      hours: new FormGroup({}),
      pmrAccess: new FormControl(structure.pmrAccess, Validators.required),
      exceptionalClosures: new FormControl(structure.exceptionalClosures),
      labelsQualifications: this.loadArrayForCheckbox(structure.labelsQualifications, false),
      accessModality: this.loadArrayForCheckbox(structure.accessModality, true),
      publicsAccompaniment: this.loadArrayForCheckbox(structure.publicsAccompaniment, false),
      proceduresAccompaniment: this.loadArrayForCheckbox(structure.proceduresAccompaniment, false),
      remoteAccompaniment: new FormControl(structure.remoteAccompaniment, Validators.required),
      otherDescription: new FormControl(structure.otherDescription),
      equipmentsAndServices: this.loadArrayForCheckbox(structure.equipmentsAndServices, false),
      publics: this.loadArrayForCheckbox(structure.publics, true),
      baseSkills: this.loadArrayForCheckbox(structure.baseSkills, false),
      accessRight: this.loadArrayForCheckbox(structure.accessRight, false),
      parentingHelp: this.loadArrayForCheckbox(structure.parentingHelp, false),
      socialAndProfessional: this.loadArrayForCheckbox(structure.socialAndProfessional, false),
      digitalCultureSecurity: this.loadArrayForCheckbox(structure.digitalCultureSecurity, false),
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

  private showCollapse(s: Structure): void {
    if (s.website) {
      this.showWebsite = true;
    }
    if (s.facebook || s.twitter || s.instagram || s.linkedin) {
      this.showSocialNetwork = true;
    }
    if (s.publicsAccompaniment.length) {
      this.showPublicsAccompaniment = true;
    }
    if (s.proceduresAccompaniment.length) {
      this.showProceduresAccompaniment = true;
    }
    this.trainingCategories.forEach((categ: { category: Category; openned: boolean }) => {
      categ.openned = false;
      switch (categ.category.id) {
        case 'accessRight':
          if (s.accessRight.length) {
            categ.openned = true;
          }
          break;
        case 'socialAndProfessional':
          if (s.socialAndProfessional.length) {
            categ.openned = true;
          }
          break;
        case 'baseSkills':
          if (s.baseSkills.length) {
            categ.openned = true;
          }
          break;
        case 'parentingHelp':
          if (s.parentingHelp.length) {
            categ.openned = true;
          }
          break;
        case 'digitalCultureSecurity':
          if (s.digitalCultureSecurity.length) {
            categ.openned = true;
          }
          break;
      }
    });
    this.equipmentsAndServices.forEach((equipment: { module: Module; openned: boolean }) => {
      equipment.openned = false;
      switch (equipment.module.id) {
        case 'ordinateurs':
          if (s.equipmentsAndServices.includes('ordinateurs')) {
            equipment.openned = true;
          }
          break;
        case 'tablettes':
          if (s.equipmentsAndServices.includes('tablettes')) {
            equipment.openned = true;
          }
          break;
        case 'bornesNumeriques':
          if (s.equipmentsAndServices.includes('bornesNumeriques')) {
            equipment.openned = true;
          }
          break;
        case 'imprimantes':
          if (s.equipmentsAndServices.includes('imprimantes')) {
            equipment.openned = true;
          }
          break;
        case 'scanners':
          if (s.equipmentsAndServices.includes('scanners')) {
            equipment.openned = true;
          }
          break;
      }
    });
  }

  private loadArrayForCheckbox(array: string[], isRequired: boolean): FormArray {
    return new FormArray(
      array.map((str) => new FormControl(str)),
      isRequired ? Validators.required : Validators.nullValidator
    );
  }
  public getStructureControl(nameControl: string): AbstractControl {
    return this.structureForm.get(nameControl);
  }

  public getAddressControl(nameControl: string): AbstractControl {
    return this.structureForm.get('address').get(nameControl);
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

  public onCheckChange(event: boolean, formControlName: string, value: string): void {
    if (value === 'wifiEnAccesLibre') {
      this.isWifiChoosen = true;
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

  // Check if a FormControl value is in FormArray
  public isInArray(term: string, formControlName: string): boolean {
    if (this.structureForm.controls[formControlName].value) {
      return this.structureForm.controls[formControlName].value.includes(term);
    }
    return false;
  }

  public setValidationsForm(): void {
    if (this.isClaimMode) {
      this.pagesValidation[PageTypeEnum.summary] = { valid: true };
      this.pagesValidation[PageTypeEnum.accountInfo] = {
        valid:
          this.accountForm.get('surname').valid &&
          this.accountForm.get('name').valid &&
          this.accountForm.get('phone').valid,
      };
      this.pagesValidation[PageTypeEnum.accountCredentials] = {
        valid:
          this.accountForm.get('email').valid &&
          this.accountForm.get('password').valid &&
          this.accountForm.get('confirmPassword').valid,
      };
      this.pagesValidation[PageTypeEnum.cgu] = { valid: this.userAcceptSavedDate };
      this.updatePageValid();
    } else if (this.isAccountMode) {
      this.pagesValidation[PageTypeEnum.accountInfo] = {
        valid:
          this.accountForm.get('surname').valid &&
          this.accountForm.get('name').valid &&
          this.accountForm.get('phone').valid,
      };
      this.pagesValidation[PageTypeEnum.accountCredentials] = {
        valid:
          this.accountForm.get('email').valid &&
          this.accountForm.get('password').valid &&
          this.accountForm.get('confirmPassword').valid,
      };
      this.pagesValidation[PageTypeEnum.cgu] = { valid: this.userAcceptSavedDate };
      this.updatePageValid();
    } else {
      this.pagesValidation[PageTypeEnum.summary] = { valid: true };
      this.pagesValidation[PageTypeEnum.info] = { valid: true };
      this.pagesValidation[PageTypeEnum.accountInfo] = {
        valid:
          this.accountForm.get('surname').valid &&
          this.accountForm.get('name').valid &&
          this.accountForm.get('phone').valid,
      };
      this.pagesValidation[PageTypeEnum.accountCredentials] = {
        valid:
          this.accountForm.get('email').valid &&
          this.accountForm.get('password').valid &&
          this.accountForm.get('confirmPassword').valid,
      };
      this.pagesValidation[PageTypeEnum.structureNameAndAddress] = {
        valid: this.getStructureControl('structureName').valid && this.getStructureControl('address').valid,
        name: 'Nom et adresse',
      };
      this.pagesValidation[PageTypeEnum.structurePhone] = {
        valid: this.getStructureControl('contactMail').valid && this.getStructureControl('contactPhone').valid,
        name: 'Contact structure',
      };
      this.pagesValidation[PageTypeEnum.structureType] = {
        valid: this.getStructureControl('structureType').valid,
        name: 'Type de structure',
      };
      this.pagesValidation[PageTypeEnum.structureAccessModality] = {
        valid: this.getStructureControl('accessModality').valid,
        name: "Modalités d'accueil",
      };
      this.pagesValidation[PageTypeEnum.structureHours] = {
        valid: this.hoursForm.valid && this.getStructureControl('exceptionalClosures').valid,
        name: "Horaires d'ouverture",
      };
      this.pagesValidation[PageTypeEnum.structurePmr] = {
        valid: this.getStructureControl('pmrAccess').valid,
        name: 'Accessibilité pour les personnes à mobilité réduite',
      };
      this.pagesValidation[PageTypeEnum.structureWebAndSocialNetwork] = {
        valid:
          (this.getStructureControl('website').valid || !this.showWebsite) &&
          ((this.getStructureControl('facebook').valid &&
            this.getStructureControl('twitter').valid &&
            this.getStructureControl('instagram').valid) ||
            !this.showSocialNetwork),
        name: 'Présence sur internet',
      };
      this.pagesValidation[PageTypeEnum.structurePublicTarget] = {
        valid: this.getStructureControl('publics').valid,
        name: 'Public admis',
      };
      this.pagesValidation[PageTypeEnum.structureAccompaniment] = {
        valid:
          this.getStructureControl('publicsAccompaniment').valid &&
          this.getStructureControl('proceduresAccompaniment').valid,
        name: 'Accompagnements proposés',
      };
      this.pagesValidation[PageTypeEnum.structureOtherAccompaniment] = {
        valid: this.getStructureControl('otherDescription').value,
        name: 'Autres démarches proposés',
      };
      this.pagesValidation[PageTypeEnum.structureRemoteAccompaniment] = {
        valid: this.getStructureControl('remoteAccompaniment').valid,
        name: 'Accompagnement à distance',
      };
      this.pagesValidation[PageTypeEnum.structureWorkshop] = {
        valid:
          this.getStructureControl('accessRight').valid &&
          this.getStructureControl('socialAndProfessional').valid &&
          this.getStructureControl('baseSkills').valid &&
          this.getStructureControl('parentingHelp').valid &&
          this.getStructureControl('digitalCultureSecurity').valid,
        name: 'Ateliers au numérique proposés',
      };
      this.pagesValidation[PageTypeEnum.structureWorkshopPrice] = {
        valid: this.getStructureControl('freeWorkShop').valid,
        name: 'Gratuité des ateliers',
      };
      this.pagesValidation[PageTypeEnum.structureWifi] = {
        valid: this.getStructureControl('equipmentsAndServices').valid && this.isWifiChoosen,
        name: 'Gratuité du wifi',
      };
      this.pagesValidation[PageTypeEnum.structureEquipments] = {
        valid:
          this.getStructureControl('equipmentsAndServices').valid &&
          this.getStructureControl('nbComputers').valid &&
          this.getStructureControl('nbPrinters').valid &&
          this.getStructureControl('nbTablets').valid &&
          this.getStructureControl('nbNumericTerminal').valid &&
          this.getStructureControl('nbScanners').valid,
        name: 'Matériels mis à disposition',
      };
      this.pagesValidation[PageTypeEnum.structureLabels] = {
        valid: this.getStructureControl('labelsQualifications').valid,
        name: 'Labélisations proposées',
      };
      this.pagesValidation[PageTypeEnum.structureOtherServices] = {
        valid: this.getStructureControl('equipmentsAndServices').valid,
        name: 'Autres services proposés',
      };
      this.pagesValidation[PageTypeEnum.structureDescription] = {
        valid: this.getStructureControl('description').valid,
        name: 'Présentation de la structure',
      };
      this.pagesValidation[PageTypeEnum.structureCovidInfo] = {
        valid: this.getStructureControl('lockdownActivity').valid,
        name: 'Informations spécifiques à la période COVID',
      };
      if (this.isEditMode) {
        this.pagesValidation[PageTypeEnum.cgu] = {
          valid: this.getStructureControl('dataShareConsentDate').valid,
          name: 'Partage de données sur data.grandlyon.com',
        };
      } else {
        this.pagesValidation[PageTypeEnum.cgu] = { valid: this.userAcceptSavedDate };
      }
      this.updatePageValid();
    }
  }

  /**
   * Update valid page or return page validity of the given index
   * @param {number} [index] - Page index
   */
  private updatePageValid(index?: number): boolean {
    if (index) {
      return this.pagesValidation[index].valid;
    }
    this.isPageValid = this.pagesValidation[this.currentPage].valid;
    return this.isPageValid;
  }

  /**
   * Page algo for claim structure case
   */
  public nextPageClaim(): void {
    if (this.currentPage === this.nbPagesForm - 1) {
      const user = new User(this.accountForm.value);
      // Create user and claim structure
      this.authService.register(user).subscribe(() => {
        if (this.userAcceptNewsletter) {
          this.newsletterService.newsletterSubscribe(user.email).subscribe(() => {});
        }
        // If joinMode, send join request, if not send claim request;
        if (this.isJoinMode) {
          this.structureService.joinStructure(this.claimStructure._id, user.email).subscribe(() => {
            this.progressStatus = 100;
          });
        } else {
          this.structureService.claimStructureWithAccount(this.claimStructure._id, user.email).subscribe(() => {
            this.progressStatus = 100;
          });
        }
      });
    }

    if (this.currentPage === PageTypeEnum.summary) {
      this.currentPage = PageTypeEnum.accountInfo;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.accountInfo) {
      this.currentPage = PageTypeEnum.accountCredentials;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.accountCredentials) {
      this.currentPage = PageTypeEnum.cgu;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.cgu) {
      this.currentPage = this.nbPagesForm;
    }

    this.progressStatus += 25;
  }
  /**
   * Page algo for create account case
   */
  public nextPageAccount(): void {
    if (this.currentPage === this.nbPagesForm - 1) {
      const user = new User(this.accountForm.value);
      // Create user with structure
      user.structuresLink = this.linkedStructureId;
      this.authService.register(user).subscribe(() => {
        this.progressStatus = 100;
      });
    }

    if (this.currentPage === PageTypeEnum.accountInfo) {
      this.currentPage = PageTypeEnum.accountCredentials;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.accountCredentials) {
      this.currentPage = PageTypeEnum.cgu;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.cgu) {
      this.currentPage = this.nbPagesForm;
    }

    this.progressStatus += 25;
  }

  /**
   * Page algo for claim structure case
   */
  public previousPageClaim(): void {
    if (this.currentPage === PageTypeEnum.accountInfo) {
      this.currentPage = PageTypeEnum.summary;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.accountCredentials) {
      this.currentPage = PageTypeEnum.accountInfo;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.cgu) {
      this.currentPage = PageTypeEnum.accountCredentials;
      this.updatePageValid();
    }

    this.progressStatus -= 25;
  }

  /**
   * Page algo for claim structure case
   */
  public previousPageAccount(): void {
    if (this.currentPage === PageTypeEnum.accountCredentials) {
      this.currentPage = PageTypeEnum.accountInfo;
      this.updatePageValid();
    } else if (this.currentPage === PageTypeEnum.cgu) {
      this.currentPage = PageTypeEnum.accountCredentials;
      this.updatePageValid();
    }

    this.progressStatus -= 25;
  }

  public nextPage(): void {
    if (this.isClaimMode) {
      this.nextPageClaim();
    } else if (this.isAccountMode) {
      this.nextPageAccount();
    } else {
      // Check if user already connected to skip accountForm pages.
      if (this.currentPage === PageTypeEnum.info && this.profile) {
        this.currentPage += 2; // Skip accountInfo pages from AccountForm
        this.progressStatus += 2 * (100 / this.nbPagesForm);
      }
      // Check if "other" isn't check to hide "other description" page
      if (
        this.currentPage === PageTypeEnum.structureAccompaniment &&
        !this.isInArray('autres', 'proceduresAccompaniment')
      ) {
        this.currentPage++; // page structureOtherAccompaniment skip and go to page structureWorkshop
        this.progressStatus += 100 / this.nbPagesForm;
      }

      if (this.currentPage === PageTypeEnum.structureWorkshop) {
        if (
          !this.structureForm.get('baseSkills').value.length &&
          !this.structureForm.get('accessRight').value.length &&
          !this.structureForm.get('parentingHelp').value.length &&
          !this.structureForm.get('socialAndProfessional').value.length &&
          !this.structureForm.get('digitalCultureSecurity').value.length
        ) {
          this.getStructureControl('freeWorkShop').reset();
          this.currentPage++;
          this.progressStatus += 100 / this.nbPagesForm;
        }
      }
      // Check if going to the last page to submit form and send email verification.
      if (this.currentPage === this.nbPagesForm - 1) {
        this.validateForm();
      } else {
        this.currentPage++;
        this.progressStatus += 100 / this.nbPagesForm;
        document.getElementsByClassName('content')[0].scrollTo(0, 0);
        this.updatePageValid();
      }
    }
  }
  public previousPage(): void {
    if (this.isClaimMode) {
      this.previousPageClaim();
    } else if (this.isAccountMode) {
      this.previousPageAccount();
    } else {
      // Check if user already connected to skip accountForm pages.
      if (this.currentPage === PageTypeEnum.structureNameAndAddress && this.profile) {
        this.currentPage -= 2; // Skip 2 pages from AccountForm
        this.progressStatus -= 2 * (100 / this.nbPagesForm);
      }

      // Check if "other" isn't check to hide "other description" page
      if (
        this.currentPage === PageTypeEnum.structureRemoteAccompaniment &&
        !this.isInArray('autres', 'proceduresAccompaniment')
      ) {
        this.currentPage--; // page 14 skip and go to page 13
        this.progressStatus -= 100 / this.nbPagesForm;
      }
      if (this.currentPage === PageTypeEnum.structureWifi) {
        if (
          !this.structureForm.get('baseSkills').value.length &&
          !this.structureForm.get('accessRight').value.length &&
          !this.structureForm.get('parentingHelp').value.length &&
          !this.structureForm.get('socialAndProfessional').value.length &&
          !this.structureForm.get('digitalCultureSecurity').value.length
        ) {
          this.currentPage--;
          this.progressStatus -= 100 / this.nbPagesForm;
        }
      }
      this.currentPage--;
      this.progressStatus -= 100 / this.nbPagesForm;
      this.updatePageValid();
    }
  }
  public showPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }
  public showConfirmPassword(): void {
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }

  public setAddressStructure(address?: Address): void {
    if (address) {
      this.getAddressControl('numero').setValue(address.numero);
      this.getAddressControl('street').setValue(address.street);
      this.getAddressControl('commune').setValue(address.commune);
    } else {
      this.structureForm.get('address').reset();
    }
    this.setValidationsForm();
  }
  public setTypeStructure(type?: string): void {
    this.getStructureControl('structureType').setValue(type);
    this.setValidationsForm();
  }
  public updateHours(form: FormGroup): void {
    this.hoursForm = form;
    this.setValidationsForm();
  }
  public setHoursError(): void {
    this.hoursForm.setErrors({ formError: true });
    this.setValidationsForm();
  }
  public onRadioBtnChange(controlName: string, bool: boolean): void {
    this.getStructureControl(controlName).setValue(bool);
    this.setValidationsForm();
  }
  public toggleWebSite(): void {
    this.showWebsite = !this.showWebsite;
    if (!this.showWebsite) {
      this.getStructureControl('website').reset();
    }
    this.setValidationsForm();
  }
  public toggleSocialNetwork(): void {
    this.showSocialNetwork = !this.showSocialNetwork;
    if (!this.showSocialNetwork) {
      this.getStructureControl('facebook').reset();
      this.getStructureControl('twitter').reset();
      this.getStructureControl('instagram').reset();
    }
    this.setValidationsForm();
  }
  public updateChoice(choice: string, controlName: string): void {
    this.onCheckChange(!this.isInArray(choice, controlName), controlName, choice);
  }
  public togglePublicsAccompaniment(): void {
    this.showPublicsAccompaniment = !this.showPublicsAccompaniment;
    if (!this.showPublicsAccompaniment) {
      this.getStructureControl('publicsAccompaniment').reset();
    }
    this.setValidationsForm();
  }
  public toggleProceduresAccompaniment(): void {
    this.showProceduresAccompaniment = !this.showProceduresAccompaniment;
    if (!this.showProceduresAccompaniment && !this.isEditMode) {
      this.getStructureControl('proceduresAccompaniment').reset();
    }
    this.setValidationsForm();
  }
  public toggleTrainingCategories(categ: { category: Category; openned: boolean }): void {
    this.trainingCategories.forEach((c: { category: Category; openned: boolean }) => {
      if (categ === c) {
        c.openned = !c.openned;
      }
    });
  }

  public toggleEquipmentsServices(equipment: { module: Module; openned: boolean }): void {
    this.onCheckChange(!equipment.openned, 'equipmentsAndServices', equipment.module.id);
    this.equipmentsAndServices.forEach((e: { module: Module; openned: boolean }) => {
      if (equipment === e) {
        e.openned = !e.openned;
        if (!equipment.openned) {
          switch (e.module.id) {
            case Equipment.computer: {
              this.getStructureControl('nbComputers').setValue(0);
              break;
            }
            case Equipment.printer: {
              this.getStructureControl('nbPrinters').setValue(0);
              break;
            }
            case Equipment.tablet: {
              this.getStructureControl('nbTablets').setValue(0);
              break;
            }
            case Equipment.bornes: {
              this.getStructureControl('nbNumericTerminal').setValue(0);
              break;
            }
            case Equipment.scanner: {
              this.getStructureControl('nbScanners').setValue(0);
              break;
            }
          }
          this.setValidationsForm();
        }
      }
    });
  }
  public acceptDataBeSaved(isAccepted: boolean): void {
    this.userAcceptSavedDate = isAccepted;
    this.setValidationsForm();
  }

  public acceptOpenData(isAccepted: boolean): void {
    let now = new Date().toString();
    this.getStructureControl('dataShareConsentDate').setValue(now);
    this.setValidationsForm();
  }

  public acceptReceiveNewsletter(isAccepted: boolean): void {
    this.userAcceptNewsletter = isAccepted;
  }

  private changeValueHandler(equipment: string, value = 0): void {
    let field = '';
    if (equipment === 'ordinateurs') field = 'nbComputers';
    if (equipment === 'tablettes') field = 'nbTablets';
    if (equipment === 'scanners') field = 'nbScanners';
    if (equipment === 'bornesNumeriques') field = 'nbNumericTerminal';
    if (equipment === 'imprimantes') field = 'nbPrinters';

    if (value === -1 && this.structureForm.value[field] === 0) return;
    this.getStructureControl(field).setValue(this.structureForm.value[field] + value);
  }

  public validateForm(): void {
    if (this.getStructureControl('freeWorkShop').value === null) {
      this.getStructureControl('freeWorkShop').setValue(false);
    }
    let structure: Structure = this.structureForm.value;
    structure.hours = this.hoursForm.value;
    // Remove equipments if value is 0
    structure.equipmentsAndServices = structure.equipmentsAndServices.filter((equipments) => {
      if (equipments === 'ordinateurs' && structure.nbComputers === 0) return false;
      if (equipments === 'tablettes' && structure.nbTablets === 0) return false;
      if (equipments === 'scanners' && structure.nbScanners === 0) return false;
      if (equipments === 'bornesNumeriques' && structure.nbNumericTerminal === 0) return false;
      if (equipments === 'imprimantes' && structure.nbPrinters === 0) return false;
      return true;
    });
    let user: User;
    // If edit mode, update setbystep
    if (this.isEditMode) {
      this.structureService.editStructure(structure).subscribe((s: Structure) => {
        this.createdStructure = this.structureService.updateOpeningStructure(s);
        this.editForm = this.createStructureForm(s);
      });
    } else {
      if (this.structureForm.valid && this.hoursForm.valid) {
        // For creation mode, check structure validity
        if (this.profile) {
          user = this.profile;
          structure.accountVerified = true;
          this.createStructure(structure, user);
        } else {
          if (this.accountForm.valid) {
            user = new User(this.accountForm.value);
            this.authService
              .register(user)
              .pipe(first())
              .subscribe(() => {
                this.createStructure(structure, user);
              });
            if (this.userAcceptNewsletter) {
              this.newsletterService.newsletterSubscribe(user.email).subscribe(() => {});
            }
          }
        }
      }
    }
  }

  private createStructure(structure: Structure, user: User): void {
    this.structureService.createStructure(structure, user).subscribe((newStructure) => {
      this.currentPage++;
      this.progressStatus += 100 / this.nbPagesForm;
      this.createdStructure = newStructure;
    });
  }
  public toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  public closeMenu(): void {
    this.showMenu = false;
  }

  public canExit(): Promise<boolean> {
    // Avoid confirmation when user submit form and leave.
    if (this.currentPage === this.nbPagesForm || this.currentPage < 3 || this.isEditMode) {
      return new Promise((resolve) => resolve(true));
    } else {
      return new Promise((resolve) => this.showModal(resolve));
    }
  }

  private showModal(resolve: Function): void {
    this.showConfirmationModal = true;
    this.resolve = resolve;
  }
  public hasRedirectionAccepted(hasAccept: boolean): void {
    this.resolve(hasAccept);
    this.showConfirmationModal = false;
  }

  // Function for editMode only

  public goToSpecificPage(numPage: number, isSave: boolean): void {
    if (isSave) {
      this.validateForm();
    } else {
      const structure = new Structure(this.editForm.value);
      this.structureForm = this.createStructureForm(structure);
      this.showCollapse(structure);
    }
    this.currentPage = numPage;
    this.updatePageValid();
  }

  public closeEditMode(): void {
    this.router.navigateByUrl('acteurs', { state: { data: this.createdStructure } });
  }

  public verifyUserExist(inputEmail): void {
    if (this.accountForm.get('email').valid) {
      this.profileService.isEmailAlreadyUsed(inputEmail).subscribe((isExist) => {
        if (isExist) {
          this.accountForm.get('email').setErrors({ alreadyExist: true });
          this.setValidationsForm();
        }
      });
    }
  }

  public displayAddStructure(): boolean {
    return this.currentPage === this.pageTypeEnum.summary && !this.isEditMode && !this.isClaimMode;
  }

  public displayClaimStructure(): boolean {
    return this.currentPage === this.pageTypeEnum.summary && !this.isEditMode && this.isClaimMode;
  }

  public structureDeleted(): void {
    this.router.navigateByUrl('acteurs');
  }

  public shouldDisplayPage(index: number): boolean {
    // handle OtherAccompaniment
    if (index == this.pageTypeEnum.structureOtherAccompaniment) {
      if (this.structureForm.value.proceduresAccompaniment.includes('autres')) return true;
      else return false;
    }
    return true;
  }

  public checkIfPasswordHasSpecialChar(password: string): boolean {
    if (password.match(CustomRegExp.SPECHAR)) return true;
    return false;
  }

  public checkIfPasswordHasDigit(password: string): boolean {
    if (password.match(CustomRegExp.DIGIT)) return true;
    return false;
  }

  public checkIfPasswordHasUpperCase(password: string): boolean {
    if (password.match(CustomRegExp.UPPERCASE)) return true;
    return false;
  }

  public checkIfPasswordHasLowerCase(password: string): boolean {
    if (password.match(CustomRegExp.LOWERCASE)) return true;
    return false;
  }
}
