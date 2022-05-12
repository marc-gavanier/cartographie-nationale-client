import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  public resetForm: FormGroup;
  public loading = false;
  public submitted = false;
  // Condition form
  public isShowConfirmPassword = false;
  public isShowPassword = false;
  public buttonTypeEnum = ButtonType;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
  }

  // getter for form fields
  get f(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }

  public onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.f.email.value).subscribe(
      () => {
        this.notificationService.showSuccess(
          'Un mail de confirmation de modification de votre mot de passe vous a été envoyé.',
          ''
        );
        this.router.navigate(['']);
      },
      () => {
        this.loading = false;
      }
    );
  }

  public goLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
