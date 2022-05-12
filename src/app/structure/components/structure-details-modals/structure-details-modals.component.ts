import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Structure } from '@gouvfr-anct/mediation-numerique';
import { ActivatedRoute, Router } from '@angular/router';
import {StructureService} from '../../../services/structure.service';
import {ProfileService} from '../../../profile/services/profile.service';
import {AuthService} from '../../../services/auth.service';
import {User} from '../../../models/user.model';

@Component({
  selector: 'app-structure-details-modals',
  templateUrl: './structure-details-modals.component.html'
})
export class StructureDetailsModalsComponent {
  @Input() public structure: Structure;
  @Input() public structureService: StructureService;

  @Output() public claimChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public deleteModalOpenned = false;
  public claimModalOpenned = false;
  public joinModalOpenned = false;

  public constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public toggleClaimModal(): void {
    this.claimModalOpenned = !this.claimModalOpenned;
  }

  public toggleDeleteModal(): void {
    this.deleteModalOpenned = !this.deleteModalOpenned;
  }

  public toggleJoinModal(): void {
    this.joinModalOpenned = !this.joinModalOpenned;
  }

  private reload(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./'], { relativeTo: this.route });
  }

  public claimStructure(shouldClaim: boolean): void {
    this.toggleClaimModal();
    if (shouldClaim) {
      this.structureService.claimStructureWithAccount(this.structure._id, this.authService.userValue.username).subscribe(() => {
        this.profileService.getProfile().then((user: User) => {
          this.claimChange.emit(true);
        });
      });
    }
  }

  public deleteStructure(shouldDelete: boolean): void {
    this.toggleDeleteModal();
    if (shouldDelete) {
      this.structureService.delete(this.structure._id).subscribe((res) => {
        this.reload();
      });
    }
  }

  public joinStructure(shouldClaim: boolean): void {
    this.toggleJoinModal();
    if (shouldClaim) {
      this.structureService.joinStructure(this.structure._id, this.authService.userValue.username).subscribe((res) => {
        this.profileService.getProfile().then((user: User) => {
          this.claimChange.emit(true);
        });
      });
    }
  }
}
