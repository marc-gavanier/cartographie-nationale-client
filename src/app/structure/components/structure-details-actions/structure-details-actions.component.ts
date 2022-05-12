import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Structure } from '@gouvfr-anct/mediation-numerique';
import { Router } from '@angular/router';
import {User} from '../../../models/user.model';
import {ProfileService} from '../../../profile/services/profile.service';
import {StructureService} from '../../../services/structure.service';
import {AuthService} from '../../../services/auth.service';

export class Owner {
  email: string;
  id: string;
}

@Component({
  selector: 'app-structure-details-actions',
  templateUrl: 'structure-details-actions.component.html'
})
export class StructureDetailsActionsComponent implements OnInit {
  @Input() public structure: Structure;

  @Output() public claimChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public toggleJoinModal: EventEmitter<void> = new EventEmitter<void>();
  @Output() public toggleDeleteModal: EventEmitter<void> = new EventEmitter<void>();

  public currentProfile: User = null;
  public structureAdmins: Owner[] = [];

  public constructor(
    public readonly profileService: ProfileService,
    private structureService: StructureService,
    private router: Router,
    private authService: AuthService
  ) {}

  public async ngOnInit(): Promise<void> {
    if (this.userIsLoggedIn()) {
      this.currentProfile = await this.profileService.getProfile();

      if (this.profileService.isAdmin()) {
        this.structureService.getStructureWithOwners(this.structure._id, this.currentProfile).subscribe((res) => {
          this.structureAdmins = res.owners;
        });
      }
    }
    this.claimChange.emit(await this.structureService.isClaimed(this.structure._id, this.currentProfile).toPromise());
  }

  public userIsLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public handleJoin(): void {
    if (this.userIsLoggedIn()) {
      this.toggleJoinModal.emit();
    } else {
      this.router.navigate(['create-structure'], { state: { newUser: this.structure, isJoin: true } });
    }
  }

  public handleModify(): void {
    this.router.navigate(['create-structure', this.structure._id]);
  }
}
