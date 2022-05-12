import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../../profile/services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { CustomRegExp } from '../../../utils/CustomRegExp';
import { MustMatch } from '../../validator/form';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.scss'],
})
export class PasswordFormComponent implements OnInit {
  public accountForm: FormGroup;
  public buttonTypeEnum = ButtonType;
  public token: string;
  public passwordError = false;
  // Condition form
  public isShowOldPassword = false;
  public isShowConfirmPassword = false;
  public isShowPassword = false;
  // Form output
  public oldPasswordNeeded: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
    if (this.auth.isLoggedIn()) {
      this.oldPasswordNeeded = true;
    }
    this.initPasswordForm();
  }

  private initPasswordForm(): void {
    if (!this.oldPasswordNeeded) {
      this.accountForm = this.formBuilder.group(
        {
          password: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
          confirmPassword: [''],
        },
        { validator: MustMatch('password', 'confirmPassword') }
      );
    } else {
      this.accountForm = this.formBuilder.group(
        {
          oldPassword: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
          password: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
          confirmPassword: [''],
        },
        { validator: MustMatch('password', 'confirmPassword') }
      );
    }
  }

  get fPassword(): { [key: string]: AbstractControl } {
    return this.accountForm.controls;
  }

  public showPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  public showConfirmPassword(): void {
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }

  public showOldPassword(): void {
    this.isShowOldPassword = !this.isShowOldPassword;
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
  public checkOldPassword(password: string): boolean {
    if (
      password !== '' &&
      (!this.checkIfPasswordHasSpecialChar(password) ||
        !this.checkIfPasswordHasDigit(password) ||
        !this.checkIfPasswordHasUpperCase(password) ||
        !this.checkIfPasswordHasLowerCase(password))
    ) {
      return false;
    } else return true;
  }

  public onSubmitPassword(): void {
    // stop here if form is invalid
    if (this.oldPasswordNeeded && !this.checkOldPassword(this.accountForm.value.oldPassword)) {
      this.passwordError = true;
      return;
    } else if (this.oldPasswordNeeded) {
      // stop here if form is invalid
      this.passwordError = false;
      this.profileService.changePassword(this.accountForm.value.password, this.accountForm.value.oldPassword).subscribe(
        () => {
          this.passwordError = false;
        },
        (error) => {
          this.passwordError = true;
        }
      );
    } else {
      this.authService.resetPasswordApply(this.token, this.accountForm.value.password).subscribe(() => {
        this.router.navigate(['']);
      });
    }
  }
  public goHome(): void {
    this.router.navigateByUrl('news');
  }
}
