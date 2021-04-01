import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StructureWithOwners } from '../../../models/structureWithOwners.model';
import { TempUser } from '../../../models/temp-user.model';
import { User } from '../../../models/user.model';
import { TypeModalProfile } from '../../../profile/enum/TypeModalProfile.enum';
import { ProfileService } from '../../../profile/services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { StructureService } from '../../../services/structure.service';
import { CustomRegExp } from '../../../utils/CustomRegExp';
import { FunctionTypeModalOptions } from '../../enum/functionTypeModalOptions.enum';
import { MustMatch } from '../../validator/form';

@Component({
  selector: 'app-structure-options-modal',
  templateUrl: './structure-options-modal.component.html',
  styleUrls: ['./structure-options-modal.component.scss'],
})
export class StructureOptionsModalComponent implements OnInit {
  // Global var
  @Input() public structure?: StructureWithOwners;
  @Input() public userProfile?: User;
  @Input() public isEditFormView? = false;
  @Output() closed = new EventEmitter();
  public active: boolean;

  // Password profile
  public formPassword: FormGroup;
  public isShowOldPassword = false;
  public isShowPassword = false;
  public isShowConfirmPassword = false;
  public passwordError = false;

  // AddAccount
  public formAddAccount: FormGroup;
  public ownerAlreadyLinked = false;

  // Email profile
  public formEmail: FormGroup;
  public changeEmail = false;

  // Modal var
  public editModal: TypeModalProfile;
  public deleteModalAccountOpenned = false;
  public deleteModalStructureOpenned = false;
  public showModalOption = false;
  public typeModalProfile = TypeModalProfile;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private structureService: StructureService
  ) {}

  ngOnInit(): void {
    this.formPassword = this.formBuilder.group(
      {
        oldPassword: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
        password: ['', [Validators.required, Validators.pattern(CustomRegExp.PASSWORD)]],
        confirmPassword: [''],
      },
      { validator: MustMatch('password', 'confirmPassword') }
    );
    this.formEmail = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(CustomRegExp.EMAIL)]],
    });
    this.formAddAccount = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(CustomRegExp.EMAIL)]],
    });
  }

  public openModalOpts(): void {
    this.showModalOption = true;
    this.active = true;
  }

  // getter for form fields
  get fmail(): { [key: string]: AbstractControl } {
    return this.formEmail.controls;
  }

  // getter for form fields
  get fAddAccount(): { [key: string]: AbstractControl } {
    return this.formAddAccount.controls;
  }

  // getter for form fields
  get fpass(): { [key: string]: AbstractControl } {
    return this.formPassword.controls;
  }

  public showOldPassword(): void {
    this.isShowOldPassword = !this.isShowOldPassword;
  }
  public showPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }
  public showConfirmPassword(): void {
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }

  public closeModalOpts(functionType: number): void {
    switch (functionType) {
      case FunctionTypeModalOptions.changeEmail:
        this.editModal = TypeModalProfile.email;
        break;
      case FunctionTypeModalOptions.changePassword:
        this.editModal = TypeModalProfile.password;
        break;
      case FunctionTypeModalOptions.deleteAccount:
        this.toggleDeleteAccountModal();
        break;
      case FunctionTypeModalOptions.addUser:
        this.editModal = TypeModalProfile.addAccount;
        this.ownerAlreadyLinked = false;
        break;
      case FunctionTypeModalOptions.removeUser:
        this.editModal = TypeModalProfile.deleteAccount;
        break;
      case FunctionTypeModalOptions.editStructure:
        this.router.navigateByUrl('/create-structure', { state: { data: this.structure.structure } });
        break;
      case FunctionTypeModalOptions.removeStructure:
        this.toggleDeleteStructureModal();
        break;
      default:
        break;
    }
    this.showModalOption = false;
    this.active = false;
  }

  // Profile Section
  public closeModalOptsProfile(): void {
    this.editModal = null;
    //this.formAddAccount.reset();
    this.formEmail.reset();
    this.formPassword.reset();
  }

  private toggleDeleteAccountModal(): void {
    this.deleteModalAccountOpenned = !this.deleteModalAccountOpenned;
  }
  private toggleDeleteStructureModal(): void {
    this.deleteModalStructureOpenned = !this.deleteModalStructureOpenned;
  }

  public deleteAccount(shouldDelete: boolean): void {
    this.toggleDeleteAccountModal();
    if (shouldDelete) {
      this.profileService.deleteProfile().subscribe(() => {
        this.logout();
      });
    }
  }

  public deleteStructure(shouldDelete: boolean): void {
    this.toggleDeleteStructureModal();
    if (shouldDelete) {
      this.structureService.delete(this.structure.structure._id).subscribe(() => {
        this.closed.emit('');
      });
    }
  }

  public logout(): void {
    this.authService.logout();
  }

  public submitPassword(): void {
    // stop here if form is invalid
    if (this.formPassword.invalid) {
      return;
    }
    this.profileService.changePassword(this.formPassword.value.password, this.formPassword.value.oldPassword).subscribe(
      () => {
        this.closeModalOptsProfile();
        this.formPassword.reset();
        this.passwordError = false;
      },
      (error) => {
        this.passwordError = true;
      }
    );
  }

  public addOwner(): void {
    // stop here if form is invalid
    if (this.formAddAccount.invalid) {
      return;
    }
    const user = new TempUser();
    user.email = this.fAddAccount.email.value;
    this.structureService.addOwnerToStructure(user, this.structure.structure._id).subscribe(
      () => {
        this.closeModalOptsProfile();
        this.formAddAccount.reset();
      },
      (err) => {
        this.ownerAlreadyLinked = true;
      }
    );
  }

  public removeOwner(owner: string): void {
    this.structureService.removeOwnerFromStructure(owner, this.structure.structure._id).subscribe(() => {
      this.structure.owners = this.structure.owners.filter((o) => o.id !== owner);
      if (this.structure.owners.length == 0) {
        this.closeModalOptsProfile();
      }
    });
  }

  public verifyEmailAlreadyUsed(inputEmail, formControl: FormControl): void {
    if (formControl.valid) {
      this.profileService.isEmailAlreadyUsed(inputEmail).subscribe((isExist) => {
        if (isExist) {
          formControl.setErrors({ alreadyExist: true });
        }
      });
    }
  }

  public submitEmail(): void {
    // stop here if form is invalid
    if (this.formEmail.invalid) {
      return;
    }
    this.profileService.changeEmail(this.formEmail.value.email, this.userProfile.email).subscribe(() => {
      this.closeModalOptsProfile();
      this.formEmail.reset();
    });
  }
}