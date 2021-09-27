import { stringify } from '@angular/compiler/src/util';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { AbstractControl, Form, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { GeoJson } from '../../map/models/geojson.model';
import { Address } from '../../models/address.model';
import { OrientationFormFilters } from '../../models/orientation-filter.object';
import { Structure } from '../../models/structure.model';
import { GeojsonService } from '../../services/geojson.service';
import { RouterListenerService } from '../../services/routerListener.service';
import { StructureService } from '../../services/structure.service';
import { CategoryEnum } from '../../shared/enum/category.enum';
import * as _ from 'lodash';
import { Category } from '../../structure-list/models/category.model';
import { Filter } from '../../structure-list/models/filter.model';
import { Module } from '../../structure-list/models/module.model';
import { SearchService } from '../../structure-list/services/search.service';
import { PageTypeEnum } from './pageType.enum';

@Component({
  selector: 'app-orientation-form',
  templateUrl: './orientation-form.component.html',
  styleUrls: ['./orientation-form.component.scss', '../structure-form/form.component.scss'],
})
export class OrientationFormComponent implements OnInit {
  public displayMapMarkerId: string;
  public selectedMarkerId: string;
  public locate = false;
  public noPassNumeric = false;
  public isMapPhone = false;
  public isLoading = false;

  public orientationForm: FormGroup;

  // Page and progress var
  public currentPage = 0; // Change this value to start on a different page for dev testing
  public progressStatus = 0;
  public nbPagesForm = 7;
  public isPageValid: boolean;
  public pagesValidation = [];

  public showStructureDetails = false;
  public selectedStructure: Structure;

  // ModalExit var
  public showConfirmationModal = false;
  private resolve: Function;

  public orientationFormFilters: OrientationFormFilters;

  public pageTypeEnum = PageTypeEnum;

  public numberAssistanceChecked;
  public filters: Filter[] = [];
  public uncheckedFilters: Filter[] = [];

  public equipments: Module[] = [];
  public assistance: Module[] = [];
  public formation: Module[] = [];
  public baseSkillssReferentiel: Category;
  public accessRightsReferentiel: Category;
  public digitalCultureSecuritysReferentiel: Category;
  public socialAndProfessionalsReferentiel: Category;
  public parentingHelpsReferentiel: Category;

  public assistanceReferentiel: Category;
  public equipmentReferentiel: Category;

  public specificProfile: Category;
  public showEquipments: boolean;
  public showAssistance: boolean;
  public showFormation: boolean;

  public multiPrint: boolean = false;

  public structuresList: Structure[];
  public structuresToPrint: Structure[] = [];

  constructor(
    private routerListener: RouterListenerService,
    private searchService: SearchService,
    private structureService: StructureService,
    private geoJsonService: GeojsonService
  ) {}

  ngOnInit(): void {
    this.orientationForm = this.createOrientationForm(new OrientationFormFilters());
    this.setValidationsForm();
    this.setCategories();
  }

  private async setCategories(): Promise<void> {
    this.searchService.getCategoriesAccompaniment().subscribe((categories: Category[]) => {
      this.assistanceReferentiel = categories[0];
      this.assistance = categories[0].modules;
    });
    const categs = await this.searchService.getCategoriesTraining().toPromise();
    categs.forEach((categ) => {
      categ.modules.forEach((module) => {
        this.formation.push(module);
      });
    });

    this.searchService.getCategoriesTraining().subscribe((referentiels) => {
      referentiels.forEach((referentiel) => {
        if (referentiel.isBaseSkills()) {
          this.baseSkillssReferentiel = referentiel;
        } else if (referentiel.isRigthtsAccess()) {
          this.accessRightsReferentiel = referentiel;
        } else if (referentiel.isDigitalCultureSecurity()) {
          this.digitalCultureSecuritysReferentiel = referentiel;
        } else if (referentiel.isParentingHelp()) {
          this.parentingHelpsReferentiel = referentiel;
        } else if (referentiel.isSocialAndProfessional()) {
          this.socialAndProfessionalsReferentiel = referentiel;
        }
      });
    });

    const equipmentsCategs = await this.searchService.getCategoriesMoreFilters().toPromise();
    equipmentsCategs.forEach((categ) => {
      if (categ.id == CategoryEnum.equipmentsAndServices) {
        categ.modules = this.filterOnlyEquipments(categ.modules);
        this.equipmentReferentiel = categ;
        categ.modules.forEach((c) => {
          this.equipments.push(c);
        });
      }
    });
    const specificProfileCategs = await this.searchService.getCategoriesMoreFilters().toPromise();
    specificProfileCategs.forEach((categ) => {
      switch (categ.id) {
        case CategoryEnum.publicsAccompaniment: {
          this.specificProfile = categ;
          break;
        }
      }
    });
  }

  private createOrientationForm(orientationFormFilters: OrientationFormFilters): FormGroup {
    return new FormGroup({
      specificProfile: this.loadArrayForCheckbox([], false),
      passNumeric: new FormControl(orientationFormFilters.passNumeric),
      equipments: this.loadArrayForCheckbox([], false),
      assistance: this.loadArrayForCheckbox([], false),
      formation: this.loadArrayForCheckbox([], false),
      address: new FormGroup({
        numero: new FormControl(''),
        street: new FormControl('', Validators.required),
        commune: new FormControl('', Validators.required),
      }),
      structureAccompaniment: new FormControl(orientationFormFilters.structureAccompaniment, Validators.required),
      contactAccompaniment: new FormControl(orientationFormFilters.contactAccompaniment),
      beneficiaryName: new FormControl(orientationFormFilters.beneficiaryName),
      beneficiaryNeedCommentary: new FormControl(orientationFormFilters.beneficiaryNeedCommentary),
    });
  }

  private loadArrayForCheckbox(array: string[], isRequired: boolean): FormArray {
    return new FormArray(
      array.map((str) => new FormControl(str)),
      isRequired ? Validators.required : Validators.nullValidator
    );
  }

  public nextPage(): void {
    this.searchStructures();
    // Check if going to the last page to submit form and send email verification.
    if (this.currentPage === this.nbPagesForm - 1) {
      this.validateForm();
    } else {
      if (
        this.currentPage === this.pageTypeEnum.beneficiaryNeed &&
        this.orientationForm.get('assistance').value.length + this.orientationForm.get('formation').value.length == 0 &&
        this.orientationForm.get('equipments').value.length > 0
      ) {
        this.noPassNumeric = true;
        this.getOrientationControl('passNumeric').setValue(false);

        this.currentPage++;
        this.progressStatus += 100 / this.nbPagesForm;
      }
      this.currentPage++;
      this.progressStatus += 100 / this.nbPagesForm;
      this.updatePageValid();
    }
  }

  public previousPage(): void {
    // Check if going to the first page
    if (this.currentPage === 0) {
      //go back to home ? previous page
    } else {
      if (this.currentPage === this.pageTypeEnum.beneficiaryInfo && this.noPassNumeric) {
        this.currentPage--;
      }
      this.currentPage--;
      this.progressStatus -= 100 / this.nbPagesForm;
      this.setStructuresAndCoord();
      this.updatePageValid();
    }
  }

  public validateForm(): void {
    if (this.orientationForm.valid) {
      //validate form
    }
  }

  private updatePageValid(): void {
    this.isPageValid = this.pagesValidation[this.currentPage].valid;
  }

  public previousUrl(): void {
    this.routerListener.goToPreviousUrl();
  }

  public setValidationsForm(): void {
    this.pagesValidation[PageTypeEnum.beneficiaryNeed] = {
      valid:
        // this.getOrientationControl('passNumeric').valid &&
        this.orientationForm.get('equipments').value.length +
          this.orientationForm.get('assistance').value.length +
          this.orientationForm.get('formation').value.length >
        0,
    };
    this.pagesValidation[PageTypeEnum.beneficiaryPassNumeric] = {
      valid: this.getOrientationControl('passNumeric').valid,
    };
    this.pagesValidation[PageTypeEnum.beneficiaryInfo] = { valid: this.orientationForm.get('address').valid };
    this.pagesValidation[PageTypeEnum.beneficiaryAccompaniment] = {
      valid:
        this.getOrientationControl('structureAccompaniment').valid &&
        this.getOrientationControl('contactAccompaniment').valid &&
        this.getOrientationControl('beneficiaryName').valid,
    };
    this.pagesValidation[PageTypeEnum.beneficiaryNeedCommentary] = {
      valid: this.getOrientationControl('beneficiaryNeedCommentary').valid,
    };
    this.pagesValidation[PageTypeEnum.printResults] = { valid: true };
    this.pagesValidation[PageTypeEnum.structuresSelection] = { valid: this.structuresToPrint.length > 0 };

    this.updatePageValid();
  }

  public hasRedirectionAccepted(hasAccept: boolean): void {
    this.resolve(hasAccept);
    this.showConfirmationModal = false;
  }

  public getOrientationControl(nameControl: string): AbstractControl {
    return this.orientationForm.get(nameControl);
  }
  public onRadioBtnChange(controlName: string, bool: boolean): void {
    this.getOrientationControl(controlName).setValue(bool);
    this.setValidationsForm();
  }

  public toggleEquipments(): void {
    this.showEquipments = !this.showEquipments;
    this.setValidationsForm();
  }

  public toggleAssistance(): void {
    this.showAssistance = !this.showAssistance;
    this.setValidationsForm();
  }

  public toggleFormation(): void {
    this.showFormation = !this.showFormation;
    this.setValidationsForm();
  }

  public filterOnlyEquipments(equipmentsAndServices: Module[]): Module[] {
    return equipmentsAndServices.filter((eqpt) =>
      ['ordinateurs', 'imprimantes', 'scanners', 'wifiEnAccesLibre'].includes(eqpt.id)
    );
  }

  public isInArray(term: string, formControlName: string): boolean {
    if (this.orientationForm.controls[formControlName].value) {
      return this.orientationForm.controls[formControlName].value.includes(term);
    }
    return false;
  }

  public updateChoice(choice: string, controlName: string): void {
    this.onCheckChange(!this.isInArray(choice, controlName), controlName, choice);
  }

  public onCheckChange(event: boolean, formControlName: string, value: string): void {
    const formArray: FormArray = this.orientationForm.get(formControlName) as FormArray;
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

  public onProfilChange(event: boolean, formControlName: string): void {
    if (event) {
      this.orientationForm.get(formControlName).setValue(true);
    } else {
      this.orientationForm.get(formControlName).setValue(false);
    }
    this.setValidationsForm();
  }

  public setAddressBeneficiary(address?: Address): void {
    if (address) {
      this.getOrientationControl('address').get('numero').setValue(address.numero);
      this.getOrientationControl('address').get('street').setValue(address.street);
      this.getOrientationControl('address').get('commune').setValue(address.commune);
    } else {
      this.orientationForm.get('address').reset();
    }
    this.setValidationsForm();
  }

  public setStructureAccompaniment(structure: string): void {
    this.getOrientationControl('structureAccompaniment').setValue(structure);
    this.setValidationsForm();
  }

  public setContactAccompaniment(contact: string): void {
    this.getOrientationControl('contactAccompaniment').setValue(contact);
    this.setValidationsForm();
  }

  public setBeneficiaryName(name: string): void {
    this.getOrientationControl('beneficiaryName').setValue(name);
    this.setValidationsForm();
  }

  public setBeneficiaryNeedCommentary(comment: string): void {
    this.getOrientationControl('beneficiaryNeedCommentary').setValue(comment);
    this.setValidationsForm();
  }

  public searchStructures(): void {
    this.filters = [];
    if (this.orientationForm.value.passNumeric) {
      this.filters.push(new Filter('labelsQualifications', 'passNumerique', 'Pass Numérique'));
    }
    if (this.orientationForm.value.specificProfile) {
      this.orientationForm.get('specificProfile').value.forEach((element) => {
        this.filters.push(new Filter('publicsAccompaniment', element));
      });
    }
    this.orientationForm.get('assistance').value.forEach((element) => {
      this.filters.push(new Filter('proceduresAccompaniment', element, this.findAssistanceName(element)));
    });
    this.orientationForm.get('equipments').value.forEach((element) => {
      this.filters.push(new Filter('equipmentsAndServices', element, this.findEquipmentName(element)));
    });
    this.orientationForm.get('formation').value.forEach((element) => {
      this.orientationForm.get('formation');
      // Put higher cat like accessRight and so on here
      this.filters.push(
        new Filter(
          this.findTrainingCategoryForSkill(element).categ,
          element,
          this.findTrainingCategoryForSkill(element).name
        )
      );
    });

    // todo - fix
    this.removeDoublonFilters();
  }

  public removeDoublonFilters(): void {
    this.uncheckedFilters.forEach((elem) => {
      this.filters = this.filters.filter((filter) => filter.value != elem.value);
    });
    this.setStructuresAndCoord();
  }

  public findEquipmentName(equipment): string {
    let name;
    this.equipmentReferentiel.modules.forEach((elem) => {
      if (elem.id === equipment) {
        name = elem.text;
      }
    });
    return name;
  }

  public findAssistanceName(skill): string {
    let name;
    this.assistanceReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        name = elem.text;
      }
    });

    return name;
  }

  public findTrainingCategoryForSkill(skill): any {
    let infos = { categ: '', name: '' };
    this.baseSkillssReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        infos.categ = this.baseSkillssReferentiel.id;
        infos.name = elem.text;
      }
    });
    this.accessRightsReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        infos.categ = this.accessRightsReferentiel.id;
        infos.name = elem.text;
      }
    });
    this.parentingHelpsReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        infos.categ = this.parentingHelpsReferentiel.id;
        infos.name = elem.text;
      }
    });
    this.socialAndProfessionalsReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        infos.categ = this.socialAndProfessionalsReferentiel.id;
        infos.name = elem.text;
      }
    });
    this.digitalCultureSecuritysReferentiel.modules.forEach((elem) => {
      if (elem.id === skill) {
        infos.categ = this.digitalCultureSecuritysReferentiel.id;
        infos.name = elem.text;
      }
    });
    return infos;
  }

  private setStructuresAndCoord(): void {
    this.geoJsonService
      .getCoord(this.orientationForm.value.address.numero, this.orientationForm.value.address.street, '69000')
      .subscribe((res) => {
        this.structureService.getStructures(this.filters).subscribe((data) => {
          data.map((structure) => {
            structure.distance = parseInt(
              this.geoJsonService.getDistance(
                structure.getLat(),
                structure.getLon(),
                res.geometry.getLat(),
                res.geometry.getLon(),
                'M'
              ),
              10
            );
          });
          this.structuresList = data.sort((a, b) => a.distance - b.distance);
        });
      });
  }

  public handleCardHover(structure: Structure): void {
    this.displayMapMarkerId = structure._id;
  }
  public mouseLeave(): void {
    this.displayMapMarkerId = undefined;
    this.structuresToPrint = this.structuresToPrint.slice();
  }

  public addToList(structure: Structure): void {
    let index = this.structuresToPrint.findIndex((elem) => elem._id == structure._id);
    if (index > -1) {
      this.structuresToPrint = this.structuresToPrint.filter((elem) => {
        return elem._id != structure._id;
      });
    } else {
      this.structuresToPrint.push(structure);
    }
    this.structuresToPrint = this.structuresToPrint.slice();
    this.setValidationsForm();
  }

  public isInPrintList(id: String): boolean {
    return this.structuresToPrint.findIndex((elem) => elem._id == id) > -1 ? true : false;
  }

  public showDetails(event: Structure): void {
    this.showStructureDetails = true;
    this.selectedStructure = event;
    //TODO Pass marker_id to map component
    this.selectedMarkerId = this.selectedStructure._id;
  }

  public closeDetails(): void {
    this.showStructureDetails = false;
  }

  public removeFilter(filter: Filter): void {
    this.filters = this.filters.filter((elem) => elem != filter);
    this.uncheckedFilters.push(filter);
    this.setStructuresAndCoord();
  }

  public restoreFilter(filter: Filter): void {
    this.uncheckedFilters = this.uncheckedFilters.filter((elem) => elem != filter);
    this.filters.push(filter);
    this.setStructuresAndCoord();
  }

  public switchMapList(): void {
    this.isMapPhone = !this.isMapPhone;
  }

  public getAddress(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.isLoading = true;
      this.geoJsonService.getAddressByCoord(position.coords.longitude, position.coords.latitude).subscribe(
        (location) => {
          if (location.properties.housenumber) {
            this.getOrientationControl('address').get('numero').setValue(location.properties.housenumber);
          }
          this.getOrientationControl('address').get('street').setValue(location.properties.street);
          this.getOrientationControl('address').get('commune').setValue(location.properties.city);
          this.setValidationsForm();
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          throw new Error(err);
        }
      );
    });
  }

  public runMultiPrint(event: boolean): void {
    this.multiPrint = event;
    setTimeout(() => {
      window.print();
    }, 1000);
  }

  @HostListener('window:afterprint', [])
  onWindowAfterPrint() {
    this.multiPrint = false;
  }
}