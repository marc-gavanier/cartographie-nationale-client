import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Structure } from '../models/structure.model';
import { Time } from '../models/time.model';
import { Day } from '../models/day.model';
import { StructureService } from '../services/structure.service';
import { SearchService } from '../structure-list/services/search.service';
import { Category } from '../structure-list/models/category.model';
import { CategoryEnum } from '../shared/enum/category.enum';
import { ProfileService } from '../profile/services/profile.service';
import { User } from '../models/user.model';
import { MustMatch } from '../shared/validator/form';
import { Address } from '../models/address.model';
import { Module } from '../structure-list/models/module.model';
import { Equipment } from '../structure-list/enum/equipment.enum';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first } from 'rxjs/operators';
import { Regex } from '../shared/enum/regex.enum';
@Component({
  selector: 'app-structureForm',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @Input() public idStructure?: string;
  @Input() public isEditMode: boolean = true;
  public profile: User;
  public createdStructure: Structure;

  // Form var
  public structureForm: FormGroup;
  public accountForm: FormGroup;
  public hoursForm: FormGroup;
  public labelsQualifications: Category;
  public publics: Category;
  public accessModality: Category;
  public publicsAccompaniment: Category;
  public proceduresAccompaniment: Category;
  public equipmentsAndServices: { module: Module; openned: boolean }[] = [];
  public trainingCategories: { category: Category; openned: boolean }[] = [];

  // Page and progress var
  public currentPage = 0;
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
  public showMenu = false;

  constructor(
    private structureService: StructureService,
    private searchService: SearchService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().then((user: User) => {
      this.profile = user;
    });

    // Check if it's a new structure or edit structure
    if (this.idStructure) {
      this.structureService.getStructure(this.idStructure).subscribe((structure) => {
        this.initForm(structure);
        this.idStructure = structure._id;
      });
    } else {
      this.initForm(new Structure());
    }
    this.setCategories();
  }

  private setCategories(): void {
    this.searchService.getCategoriesAccompaniment().subscribe((categories: Category[]) => {
      this.proceduresAccompaniment = categories[0];
    });
    this.searchService.getCategoriesMoreFilters().subscribe((categories: Category[]) => {
      categories.forEach((categ) => {
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
    });
    this.searchService.getCategoriesTraining().subscribe((categories: Category[]) => {
      categories.forEach((categ) => {
        this.trainingCategories.push({ category: categ, openned: false });
      });
    });
  }

  private initForm(structure: Structure): void {
    // Init account Form
    this.accountForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.pattern(Regex.email)]), //NOSONAR
        name: new FormControl('', [Validators.required, Validators.pattern(Regex.textWithoutNumber)]), //NOSONAR
        surname: new FormControl('', [Validators.required, Validators.pattern(Regex.textWithoutNumber)]), //NOSONAR
        phone: new FormControl('', [Validators.required, Validators.pattern(Regex.phone)]), //NOSONAR
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/), //NOSONAR
        ]),
        confirmPassword: new FormControl(''),
      },
      [MustMatch('password', 'confirmPassword')]
    );

    // Init form
    this.structureForm = new FormGroup({
      _id: new FormControl(structure._id),
      coord: new FormControl(structure.coord),
      structureType: new FormControl(structure.structureType, Validators.required),
      structureName: new FormControl(structure.structureName, Validators.required),
      description: new FormControl(structure.description),
      lockdownActivity: new FormControl(structure.description),
      address: new FormGroup({
        numero: new FormControl(structure.address.numero),
        street: new FormControl(structure.address.street, Validators.required),
        commune: new FormControl(structure.address.commune, Validators.required),
      }),
      contactMail: new FormControl(structure.contactMail, [
        Validators.required,
        Validators.pattern(Regex.email), //NOSONAR
      ]),
      contactPhone: new FormControl(structure.contactPhone, [
        Validators.required,
        Validators.pattern(Regex.phone), //NOSONAR
      ]),
      website: new FormControl(structure.website, Validators.pattern(Regex.website)), //NOSONAR
      facebook: new FormControl(structure.facebook, Validators.pattern(Regex.facebook)), //NOSONAR
      twitter: new FormControl(structure.twitter, Validators.pattern(Regex.twitter)), //NOSONAR
      instagram: new FormControl(structure.instagram, Validators.pattern(Regex.instagram)), //NOSONAR
      linkedin: new FormControl(structure.linkedin, Validators.pattern(Regex.linkedIn)), //NOSONAR
      hours: new FormGroup({}),
      pmrAccess: new FormControl(structure.pmrAccess, Validators.required),
      exceptionalClosures: new FormControl(structure.exceptionalClosures),
      labelsQualifications: this.loadArrayForCheckbox(structure.labelsQualifications, false),
      accessModality: this.loadArrayForCheckbox(structure.accessModality, true),
      publicsAccompaniment: this.loadArrayForCheckbox(structure.publicsAccompaniment, false),
      proceduresAccompaniment: this.loadArrayForCheckbox(structure.proceduresAccompaniment, false),
      otherDescription: new FormControl(structure.otherDescription),
      equipmentsAndServices: this.loadArrayForCheckbox(structure.equipmentsAndServices, false),
      publics: this.loadArrayForCheckbox(structure.publics, true),
      baseSkills: this.loadArrayForCheckbox(structure.baseSkills, false),
      accessRight: this.loadArrayForCheckbox(structure.accessRight, false),
      parentingHelp: this.loadArrayForCheckbox(structure.parentingHelp, false),
      socialAndProfessional: this.loadArrayForCheckbox(structure.socialAndProfessional, false),
      digitalCultureSecurity: this.loadArrayForCheckbox(structure.digitalCultureSecurity, false),
      nbComputers: new FormControl(
        structure.equipmentsAndServices.includes('ordinateurs') ? structure.nbComputers : 1,
        [Validators.required, Validators.pattern(Regex.noNullNumber)] //NOSONAR
      ),
      nbPrinters: new FormControl(structure.equipmentsAndServices.includes('imprimantes') ? structure.nbPrinters : 1, [
        Validators.required,
        Validators.pattern(Regex.noNullNumber), //NOSONAR
      ]),
      nbTablets: new FormControl(structure.equipmentsAndServices.includes('tablettes') ? structure.nbTablets : 1, [
        Validators.required,
        Validators.pattern(Regex.noNullNumber), //NOSONAR
      ]),
      nbNumericTerminal: new FormControl(
        structure.equipmentsAndServices.includes('bornesNumeriques') ? structure.nbNumericTerminal : 1,
        [Validators.required, Validators.pattern(Regex.noNullNumber)] //NOSONAR
      ),
      nbScanners: new FormControl(
        structure.equipmentsAndServices.includes('scanners') ? structure.nbScanners : 1,
        [Validators.required, Validators.pattern(Regex.noNullNumber)] //NOSONAR
      ),
      freeWorkShop: new FormControl(structure.freeWorkShop, Validators.required),
      freeWifi: new FormControl(structure.freeWifi, Validators.required),
    });

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
    this.setValidationsForm();
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

  public modifyPhoneInput(form: FormGroup, controlName: string, phoneNumber: string): void {
    // Take length of phone number without spaces.
    let phoneNoSpace = phoneNumber.replace(/\s/g, '');
    // Check to refresh every 2 number.
    if (phoneNoSpace.length % 2 == 0) {
      // Add space every 2 number
      form.get(controlName).setValue(phoneNoSpace.replace(/(?!^)(?=(?:\d{2})+$)/g, ' ')); //NOSONAR
    }
    this.setValidationsForm();
  }

  private createDay(day: Day): FormGroup {
    return new FormGroup({
      open: new FormControl(day.open, Validators.required),
      time: new FormArray(day.time.map((oneTime) => this.createTime(oneTime))) as FormArray,
    });
  }
  private createTime(time: Time): FormGroup {
    return new FormGroup({
      openning: new FormControl(time.openning, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')), //NOSONAR
      closing: new FormControl(time.closing, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')), //NOSONAR
    });
  }

  public onCheckChange(event: boolean, formControlName: string, value: string): void {
    const formArray: FormArray = this.structureForm.get(formControlName) as FormArray;
    if (event) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(value));
    } else {
      // Remove uncheck control in the arrayForm
      const index = formArray.controls.findIndex((element) => element.value == value);
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
    this.pagesValidation[0] = { valid: true };
    this.pagesValidation[1] = { valid: true };
    this.pagesValidation[2] = {
      valid:
        this.accountForm.get('surname').valid &&
        this.accountForm.get('name').valid &&
        this.accountForm.get('phone').valid,
    };
    this.pagesValidation[3] = {
      valid:
        this.accountForm.get('email').valid &&
        this.accountForm.get('password').valid &&
        this.accountForm.get('confirmPassword').valid,
    };
    this.pagesValidation[4] = {
      valid: this.getStructureControl('structureName').valid && this.getStructureControl('address').valid,
    };
    this.pagesValidation[5] = { valid: this.getStructureControl('contactPhone').valid };
    this.pagesValidation[6] = { valid: this.getStructureControl('structureType').valid };
    this.pagesValidation[7] = { valid: this.getStructureControl('accessModality').valid };
    this.pagesValidation[8] = { valid: this.hoursForm.valid };
    this.pagesValidation[9] = { valid: this.getStructureControl('exceptionalClosures').valid };
    this.pagesValidation[10] = { valid: this.getStructureControl('pmrAccess').valid };
    this.pagesValidation[11] = {
      valid:
        this.getStructureControl('contactMail').valid &&
        (this.getStructureControl('website').valid || !this.showWebsite) &&
        ((this.getStructureControl('facebook').valid &&
          this.getStructureControl('twitter').valid &&
          this.getStructureControl('instagram').valid) ||
          !this.showSocialNetwork),
    };
    this.pagesValidation[12] = { valid: this.getStructureControl('publics').valid };
    this.pagesValidation[13] = {
      valid:
        this.getStructureControl('publicsAccompaniment').valid &&
        this.getStructureControl('proceduresAccompaniment').valid,
    };
    this.pagesValidation[14] = {
      valid: this.getStructureControl('otherDescription').value,
    };
    this.pagesValidation[15] = {
      valid:
        this.getStructureControl('accessRight').valid &&
        this.getStructureControl('socialAndProfessional').valid &&
        this.getStructureControl('baseSkills').valid &&
        this.getStructureControl('parentingHelp').valid &&
        this.getStructureControl('digitalCultureSecurity').valid,
    };
    this.pagesValidation[16] = { valid: this.getStructureControl('freeWorkShop').valid };
    this.pagesValidation[17] = { valid: this.getStructureControl('freeWifi').valid };
    this.pagesValidation[18] = {
      valid:
        this.getStructureControl('equipmentsAndServices').valid &&
        this.getStructureControl('nbComputers').valid &&
        this.getStructureControl('nbPrinters').valid &&
        this.getStructureControl('nbTablets').valid &&
        this.getStructureControl('nbNumericTerminal').valid &&
        this.getStructureControl('nbScanners').valid,
    };
    this.pagesValidation[19] = { valid: this.getStructureControl('labelsQualifications').valid };
    this.pagesValidation[20] = { valid: this.getStructureControl('equipmentsAndServices').valid };
    this.pagesValidation[21] = { valid: this.getStructureControl('description').valid };
    this.pagesValidation[22] = { valid: this.getStructureControl('lockdownActivity').valid };
    this.pagesValidation[23] = { valid: this.userAcceptSavedDate };
    //this.pagesValidation[24] = { valid: true };
    this.updatePageValid();
  }

  private updatePageValid(): void {
    this.isPageValid = this.pagesValidation[this.currentPage].valid;
  }
  public nextPage(): void {
    // Check if user already connected to skip accountForm pages.
    if (this.currentPage == 1 && this.profile) {
      this.currentPage += 2; // Skip 2 pages from AccountForm
      this.progressStatus += 2 * (100 / this.nbPagesForm);
    }
    // Check if "other" isn't check to hide "other description" page
    if (this.currentPage == 13 && !this.isInArray('autres', 'proceduresAccompaniment')) {
      this.currentPage++; // page 14 skip and go to page 15
      this.progressStatus += 100 / this.nbPagesForm;
    }

    // Check if going to the last page to submit form and send email verification.
    if (this.currentPage == this.nbPagesForm - 1) {
      this.validateForm();
    } else {
      this.currentPage++;
      this.progressStatus += 100 / this.nbPagesForm;
      this.updatePageValid();
    }
  }
  public previousPage(): void {
    // Check if user already connected to skip accountForm pages.
    if (this.currentPage == 4 && this.profile) {
      this.currentPage -= 2; // Skip 2 pages from AccountForm
      this.progressStatus -= 2 * (100 / this.nbPagesForm);
    }

    // Check if "other" isn't check to hide "other description" page
    if (this.currentPage == 15 && !this.isInArray('autres', 'proceduresAccompaniment')) {
      this.currentPage--; // page 14 skip and go to page 13
      this.progressStatus -= 100 / this.nbPagesForm;
    }
    this.currentPage--;
    this.progressStatus -= 100 / this.nbPagesForm;
    this.updatePageValid();
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
    if (!this.showProceduresAccompaniment) {
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
              this.getStructureControl('nbComputers').setValue(1);
              break;
            }
            case Equipment.printer: {
              this.getStructureControl('nbPrinters').setValue(1);
              break;
            }
            case Equipment.tablet: {
              this.getStructureControl('nbTablets').setValue(1);
              break;
            }
            case Equipment.bornes: {
              this.getStructureControl('nbNumericTerminal').setValue(1);
              break;
            }
            case Equipment.scanner: {
              this.getStructureControl('nbScanners').setValue(1);
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

  public validateForm(): void {
    if (this.structureForm.valid && this.hoursForm.valid) {
      let structure: Structure = this.structureForm.value;
      structure.hours = this.hoursForm.value;
      let user: User;
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
        }
      }
    }
  }

  private createStructure(structure: Structure, user: User): void {
    this.structureService.createStructure(structure, user).subscribe((structure) => {
      this.currentPage++;
      this.progressStatus += 100 / this.nbPagesForm;
      this.createdStructure = structure;
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
    if (this.currentPage == this.nbPagesForm) {
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
}