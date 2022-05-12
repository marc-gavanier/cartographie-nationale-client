import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { StructureService } from '../../../services/structure.service';
import {Structure} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-data-share-consent',
  templateUrl: './data-share-consent.component.html',
  styleUrls: ['./data-share-consent.component.scss'],
})
export class DataShareConsentComponent implements OnInit {
  public consentForm: FormGroup;
  public isPageValid: boolean;
  public loading = false;
  public submitted = false;
  public eventsSubject: Subject<Object> = new Subject<Object>();

  constructor(private structureService: StructureService) {}

  @Input() public openned: boolean = true;
  @Input() public dataConsentPendingStructures: Structure[];

  ngOnInit() {
    this.consentForm = new FormGroup({});
    for (let structure of this.dataConsentPendingStructures) {
      this.consentForm.addControl(
        structure._id,
        new FormControl(structure.dataShareConsentDate, [Validators.required])
      );
    }
  }

  public getFormControl(nameControl: string): AbstractControl {
    return this.consentForm.get(nameControl);
  }

  public getPendingStructure(id: string): Structure {
    var result = this.dataConsentPendingStructures.filter(function (o) {
      return o._id == id;
    });
    return result ? result[0] : null;
  }

  public onRadioBtnChangeAll(bool: boolean): void {
    for (let structure of this.dataConsentPendingStructures) {
      structure.dataShareConsentDate = bool ? new Date().toString() : null;
      this.getFormControl(structure._id).setValue(bool);
    }
    this.setValidationsForm();
  }

  public onRadioBtnChangeStructure(controlName: string, bool: boolean): void {
    this.getPendingStructure(controlName).dataShareConsentDate = bool ? new Date().toString() : null;
    this.getFormControl(controlName).setValue(bool);

    // select or unselect "all structures" radio button
    let isAllYes: boolean = true;
    let isAllNo: boolean = true;
    for (let structure of this.dataConsentPendingStructures) {
      isAllYes = isAllYes && this.getFormControl(structure._id).value === true;
      isAllNo = isAllNo && this.getFormControl(structure._id).value === false;
    }
    this.eventsSubject.next(isAllYes ? true : isAllNo ? false : null);

    this.setValidationsForm();
  }

  public setValidationsForm(): void {
    let isPageValid: boolean = true;
    for (let structure of this.dataConsentPendingStructures) {
      isPageValid = isPageValid && this.getFormControl(structure._id).valid;
    }
    this.isPageValid = isPageValid;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.loading = true;
    for (let structure of this.dataConsentPendingStructures) {
      this.structureService.editStructure(structure).subscribe((s: Structure) => {});
    }
    this.loading = false;
    this.openned = false;
  }
}
