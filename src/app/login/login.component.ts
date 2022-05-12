import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { StructureService } from '../services/structure.service';
import { CustomRegExp } from '../utils/CustomRegExp';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Structure} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public authFailed = false;
  public isShowPassword = false;
  public buttonTypeEnum = ButtonType;
  public isWelcome = false;
  public userId: string;
  public token: string;
  public structure: Structure;
  public verificationSuccess = false;
  public verificationIssue = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private structureService: StructureService
  ) {}

  ngOnInit(): void {
    // Subscribe to routing for user
    const urlParametrs = combineLatest([this.activatedRoute.parent.url, this.activatedRoute.queryParams]).pipe(
      map((results) => ({
        url: results[0],
        token: results[1].token,
      }))
    );

    urlParametrs.subscribe((routeParams: { url: UrlSegment[]; token: string }) => {
      // Write code to use routeParams and queryParams.
      if (routeParams.url[0].path === 'users' && routeParams.url[1].path === 'verify' && routeParams.url[2]) {
        this.isWelcome = true;
        this.userId = routeParams.url[2].path;
        this.token = routeParams.token;
        this.sendVerification();
      }
    });

    // login form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(CustomRegExp.EMAIL)]],
      password: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
    });
  }

  // getter for form fields
  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  public swithToResetPassword(): void {
    this.router.navigate(['/reset-password']);
  }

  public onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        () => {
          if (this.isWelcome) {
            this.router.navigateByUrl('form/profile');
          } else {
            this.router.navigateByUrl('news');
          }
        },
        () => {
          this.loading = false;
          this.authFailed = true;
        }
      );
  }

  public toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }
  public goToAccountCreation(): void {
    this.router.navigateByUrl('form/account');
  }

  private sendVerification(): void {
    this.authService.verifyUser(this.userId, this.token).subscribe(
      (user: User) => {
        if (user.structuresLink[0]) {
          this.structureService.getStructure(user.structuresLink[0]).subscribe(
            (structure) => {
              structure.accountVerified = true;
              this.structure = structure;
              this.structureService.updateStructureAfterOwnerVerify(structure._id, user).subscribe(
                () => {
                  this.verificationSuccess = true;
                },
                () => {
                  this.verificationIssue = true;
                }
              );
            },
            () => {
              this.verificationIssue = true;
            }
          );
        } else {
          this.verificationSuccess = true;
        }
      },
      () => {
        this.verificationIssue = true;
      }
    );
  }
}
