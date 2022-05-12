import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Job } from '../../../../models/job.model';
import { ProfileService } from '../../../../profile/services/profile.service';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-profile-job-selection',
  templateUrl: './profile-job-selection.component.html',
  styleUrls: ['./profile-job-selection.component.scss'],
})
export class ProfileJobSelectionComponent implements OnInit {
  @Input() profileForm: FormGroup;
  @Output() validateForm = new EventEmitter<Job>();
  public jobs: Job[];
  public selectedJob: Job;
  public buttonTypeEnum = ButtonType;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    // getJobs
    this.profileService.getJobs().subscribe((jobs) => {
      this.jobs = [...jobs, new Job({ name: 'Autre' })];
    });
  }

  public selectedResult(job: Job): void {
    this.selectedJob = job;
    if (!this.isUnexistingJob()) {
      this.profileForm.get('job').setValue({
        name: job.name,
        validated: job.validated,
        hasPersonalOffer: job.hasPersonalOffer,
      });
    } else {
      this.profileForm.get('job').setValue({
        name: '',
        validated: false,
        hasPersonalOffer: true,
      });
    }
    this.validateForm.emit();
  }

  public isSelectedJob(job: Job): boolean {
    if (this.selectedJob && this.selectedJob.name === job.name) return true;
    return false;
  }

  public isUnexistingJob(): boolean {
    if (this.selectedJob && this.selectedJob.name === 'Autre') return true;
    return false;
  }

  public newJob(event: any): any {
    this.profileForm.get('job').patchValue({
      name: event,
      validated: false,
    });
    this.validateForm.emit();
  }
}
