import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Employer } from '../../../../models/employer.model';
import { ProfileService } from '../../../../profile/services/profile.service';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-profile-employer-selection',
  templateUrl: './profile-employer-selection.component.html',
  styleUrls: ['./profile-employer-selection.component.scss'],
})
export class ProfileEmployerSelectionComponent {
  @Input() profileForm: FormGroup;
  @Output() validateForm = new EventEmitter<Employer>();
  @ViewChild('searchEmployer', { static: true }) searchEmployer: ElementRef;
  public buttonTypeEnum = ButtonType;
  public employers: Employer[];
  public isAlreadySearching = false;

  constructor(private profileService: ProfileService) {}

  public onSearchChange(searchString: string): void {
    if (searchString.length <= 2) this.getEmployers();
    this.getEmployers(searchString);
    this.profileForm.get('employer').patchValue({
      name: searchString,
      validated: false,
    });
    this.validateForm.emit();
  }

  public selectedResult(employer: Employer): void {
    this.searchEmployer.nativeElement.value = employer.name;
    this.profileForm.get('employer').patchValue({
      name: employer.name,
      validated: employer.validated,
    });
    this.employers = [];
    this.validateForm.emit();
  }

  private getEmployers(searchString: string = '') {
    if (!this.isAlreadySearching) {
      this.isAlreadySearching = true;
      this.profileService.getEmployers(searchString).subscribe((employers) => {
        this.employers = employers;
        this.isAlreadySearching = false;
      });
    }
  }
}
