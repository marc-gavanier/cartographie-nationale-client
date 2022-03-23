import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Structure } from '../../../models/structure.model';
import { Module } from '../../models/module.model';
import { Category } from '../../models/category.model';
import { AccessModality } from '../../enum/access-modality.enum';
import { SearchService } from '../../services/search.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintService } from '../../../shared/service/print.service';
import { Equipment } from '../../enum/equipment.enum';
import { StructureService } from '../../../services/structure.service';
import { TclService } from '../../../services/tcl.service';
import { TclStopPoint } from '../../../models/tclStopPoint.model';
import { ProfileService } from '../../../profile/services/profile.service';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { PublicCategorie } from '../../enum/public.enum';
import { Owner } from '../../../models/owner.model';
import { style, animate, transition, trigger, group } from '@angular/animations';

@Component({
  selector: 'app-structure-details',
  templateUrl: './structure-details.component.html',
  styleUrls: ['./structure-details.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        group([animate(200, style({ height: '*' })), animate('200ms ease-in-out', style({ opacity: '1' }))]),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        group([animate(1, style({ height: 0 })), animate(1, style({ opacity: '0' }))]),
      ]),
    ]),
  ],
})
export class StructureDetailsComponent implements OnInit {
  @Input() public structure: Structure;
  @Output() public closeDetails: EventEmitter<boolean> = new EventEmitter<boolean>();
  public accessModality = AccessModality;

  public baseSkillssReferentiel: Category;
  public accessRightsReferentiel: Category;
  public digitalCultureSecuritysReferentiel: Category;
  public socialAndProfessionalsReferentiel: Category;
  public parentingHelpsReferentiel: Category;
  public baseSkills: Module[];
  public accessRights: Module[];
  public parentingHelp: Module[];
  public socialAndProfessional: Module[];
  public digitalCultureSecurity: Module[];
  public showBaseSkills: boolean;
  public showAccessRights: boolean;
  public showParentingHelp: boolean;
  public showSocialAndProfessional: boolean;
  public showDigitalSecurity: boolean;
  public tclStopPoints: TclStopPoint[] = [];
  public printMode = false;
  public isClaimed: boolean = null;
  public isLoading: boolean = false;
  public currentProfile: User = null;
  public deleteModalOpenned = false;
  public claimModalOpenned = false;
  public structureErrorModalOpenned = false;
  public joinModalOpenned = false;
  public structureAdmins: Owner[] = [];

  constructor(
    private printService: PrintService,
    private searchService: SearchService,
    private structureService: StructureService,
    private tclService: TclService,
    private profileService: ProfileService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.url.subscribe((url) => {
      if (url[0].path === 'structure') {
        this.structure = this.printService.structure;
        this.printMode = true;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    if (this.userIsLoggedIn()) {
      this.currentProfile = await this.profileService.getProfile();

      if (this.profileService.isAdmin()) {
        this.structureService.getStructureWithOwners(this.structure._id, this.currentProfile).subscribe((res) => {
          this.structureAdmins = res.owners;
        });
      }
    }
    this.isClaimed = await this.structureService.isClaimed(this.structure._id, this.currentProfile).toPromise();

    // GetTclStopPoints
    this.getTclStopPoints();
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
      this.setServiceCategories();
      if (this.printMode) {
        this.printService.onDataReady();
      }
      this.isLoading = false;
    });
    const index = this.structure.proceduresAccompaniment.indexOf('autres');
    if (index > -1) {
      this.structure.proceduresAccompaniment.splice(index, 1);
    }
  }

  public userIsLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public getEquipmentsLabel(equipment: Equipment): string {
    switch (equipment) {
      case Equipment.wifi:
        return 'Wifi en accès libre';
      case Equipment.bornes:
        return this.structure.nbNumericTerminal > 1 ? 'Bornes numériques' : 'Borne numérique';
      case Equipment.printer:
        return this.structure.nbPrinters > 1 ? 'Imprimantes' : 'Imprimante';
      case Equipment.tablet:
        return this.structure.nbTablets > 1 ? 'Tablettes' : 'Tablette';
      case Equipment.computer:
        return this.structure.nbComputers > 1 ? 'Ordinateurs à disposition' : 'Ordinateur à disposition';
      case Equipment.scanner:
        return this.structure.nbScanners > 1 ? 'Scanners' : 'Scanner';
      default:
        return null;
    }
  }

  public close(): void {
    this.route.url.subscribe((urls) => {
      if (urls[0].path != 'orientation') {
        this.router.navigate(['/acteurs'], {
          relativeTo: this.route,
          queryParams: {
            id: null,
          },
          queryParamsHandling: 'merge',
        });
      } else {
        this.closeDetails.emit();
      }
    });
  }

  public print(): void {
    this.printService.printDocument('structure', this.structure);
  }

  public toggleDeleteModal(): void {
    this.deleteModalOpenned = !this.deleteModalOpenned;
  }

  public toggleClaimModal(): void {
    this.claimModalOpenned = !this.claimModalOpenned;
  }

  public toggleJoinModal(): void {
    this.joinModalOpenned = !this.joinModalOpenned;
  }

  public handleClaim(): void {
    if (this.userIsLoggedIn()) {
      this.toggleClaimModal();
    } else {
      this.router.navigate(['create-structure'], { state: { newUser: this.structure } });
    }
  }
  public handleJoin(): void {
    if (this.userIsLoggedIn()) {
      this.toggleJoinModal();
    } else {
      this.router.navigate(['create-structure'], { state: { newUser: this.structure, isJoin: true } });
    }
  }
  public handleModify(): void {
    this.router.navigate(['create-structure', this.structure._id]);
  }

  public deleteStructure(shouldDelete: boolean): void {
    this.toggleDeleteModal();
    if (shouldDelete) {
      this.structureService.delete(this.structure._id).subscribe((res) => {
        this.reload();
      });
    }
  }

  private reload(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./'], { relativeTo: this.route });
  }
  public claimStructure(shouldClaim: boolean): void {
    this.toggleClaimModal();
    if (shouldClaim) {
      this.structureService
        .claimStructureWithAccount(this.structure._id, this.authService.userValue.username)
        .subscribe(() => {
          this.profileService.getProfile().then((user: User) => {
            this.isClaimed = true;
          });
        });
    }
  }

  public joinStructure(shouldClaim: boolean): void {
    this.toggleJoinModal();
    if (shouldClaim) {
      this.structureService.joinStructure(this.structure._id, this.authService.userValue.username).subscribe((res) => {
        this.profileService.getProfile().then((user: User) => {
          this.isClaimed = true;
        });
      });
    }
  }

  public getAccessLabel(accessModality: AccessModality): string {
    switch (accessModality) {
      case AccessModality.free:
        return 'Accès libre';
      case AccessModality.meeting:
        return 'Sur rendez-vous';
      case AccessModality.meetingOnly:
        return 'Uniquement sur RDV';
      case AccessModality.numeric:
        return 'Téléphone / Visio';
      default:
        return null;
    }
  }

  public getPublicLabel(tagetPublic: PublicCategorie): string {
    switch (tagetPublic) {
      case PublicCategorie.young:
        return 'Jeunes (16 - 25 ans)';
      case PublicCategorie.adult:
        return 'Adultes';
      case PublicCategorie.elderly:
        return 'Séniors (+ de 65 ans)';
      case PublicCategorie.all:
        return 'Tout public';
      case PublicCategorie.under16Years:
        return 'Moins de 16 ans';
      case PublicCategorie.women:
        return 'Uniquement femmes';
      default:
        return null;
    }
  }

  public setServiceCategories(): void {
    this.baseSkills = this.structure.baseSkills.map((skill) =>
      _.find(this.baseSkillssReferentiel.modules, { id: skill })
    );
    this.accessRights = this.structure.accessRight.map((rights) =>
      _.find(this.accessRightsReferentiel.modules, { id: rights })
    );
    this.parentingHelp = this.structure.parentingHelp.map((help) =>
      _.find(this.parentingHelpsReferentiel.modules, { id: help })
    );
    this.socialAndProfessional = this.structure.socialAndProfessional.map((skill) =>
      _.find(this.socialAndProfessionalsReferentiel.modules, { id: skill })
    );
    this.digitalCultureSecurity = this.structure.digitalCultureSecurity.map((skill) =>
      _.find(this.digitalCultureSecuritysReferentiel.modules, { id: skill })
    );
  }

  public keepOriginalOrder = (a, b) => a.key;

  public isBaseSkills(): boolean {
    return this.baseSkills && this.baseSkills[0] !== undefined;
  }
  public isAccessRights(): boolean {
    return this.accessRights && this.accessRights[0] !== undefined;
  }
  public isParentingHelp(): boolean {
    return this.parentingHelp && this.parentingHelp[0] !== undefined;
  }
  public isSocialAndProfessional(): boolean {
    return this.socialAndProfessional && this.socialAndProfessional[0] !== undefined;
  }
  public isDigitalSecurity(): boolean {
    return this.digitalCultureSecurity && this.digitalCultureSecurity[0] !== undefined;
  }

  public getTclStopPoints(): void {
    this.tclService.getTclStopPointBycoord(this.structure.getLon(), this.structure.getLat()).subscribe((res) => {
      this.tclStopPoints = res;
    });
  }

  public filterOnlyEquipments(equipmentsAndServices: string[]): string[] {
    return equipmentsAndServices.filter((eqpt) =>
      ['ordinateurs', 'tablettes', 'bornesNumeriques', 'imprimantes', 'scanners', 'wifiEnAccesLibre'].includes(eqpt)
    );
  }

  public displayJoin(): boolean {
    return (
      !(this.profileService.isLinkedToStructure(this.structure._id) || this.profileService.isAdmin()) &&
      this.isClaimed &&
      !this.profileService.isPendingLinkedToStructure(this.structure._id)
    );
  }

  public displayModalError(): void {
    this.structureErrorModalOpenned = !this.structureErrorModalOpenned;
  }

  public sendErrorEmail(modalValue: any): void {
    this.displayModalError();
    if (modalValue.shouldSend) {
      this.structureService.sendMailOnStructureError(this.structure._id, modalValue.content).subscribe(() => {});
    }
  }

  public multipleWorkshop(): boolean {
    if (
      this.structure.baseSkills.length +
        this.structure.accessRight.length +
        this.structure.parentingHelp.length +
        this.structure.socialAndProfessional.length +
        this.structure.digitalCultureSecurity.length >
      1
    ) {
      return true;
    }
    return false;
  }

  public toggleBaseSkills(): void {
    this.showBaseSkills = !this.showBaseSkills;
  }
  public toggleAccessRights(): void {
    this.showAccessRights = !this.showAccessRights;
  }
  public toggleParentingHelp(): void {
    this.showParentingHelp = !this.showParentingHelp;
  }
  public toggleSocialAndProfessional(): void {
    this.showSocialAndProfessional = !this.showSocialAndProfessional;
  }
  public toggleDigitalSecurity(): void {
    this.showDigitalSecurity = !this.showDigitalSecurity;
  }

  public goToWebsite(): void {
    window.open(this.structure.website, '_blank');
  }
}
