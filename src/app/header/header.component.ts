import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProfileService } from '../profile/services/profile.service';
import { AuthService } from '../services/auth.service';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Structure} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public showMenu = false;
  public currentRoute = '';
  public formRoute = '/create-structure';
  public returnUrl = null;
  public dataConsentPendingStructures: Structure[];
  private displayDataShare = false;
  private loadingDataShare = false;
  public buttonTypeEnum = ButtonType;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }
  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   if (params.verified || params.returnUrl) {
    //     Promise.resolve().then(() => {
    //       if (!this.isLoggedIn) {
    //         this.isPopUpOpen = true;
    //         this.displaySignUp = true;
    //       }
    //     });
    //     this.returnUrl = params.returnUrl;
    //   }
    // });
  }

  public openMenu(): void {
    this.showMenu = true;
  }
  public closeMenu(): void {
    this.showMenu = false;
  }

  public get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public get isDisplayDataShare(): boolean {
    if (this.displayDataShare) {
      return this.displayDataShare;
    } else {
      if (this.isLoggedIn && !this.loadingDataShare) {
        this.loadingDataShare = true;
        this.profileService.getAllDataConsentPendingStructures().subscribe((dataConsentPendingStructures) => {
          if (dataConsentPendingStructures.length) {
            this.displayDataShare = true;
            this.dataConsentPendingStructures = dataConsentPendingStructures;
            return this.displayDataShare;
          }
        });
      }
    }
    return false;
  }
  public goToLoginPage(): void {
    this.router.navigateByUrl('login');
  }
  public get isAdmin(): boolean {
    return this.profileService.isAdmin();
  }

  public get displayName(): string {
    return this.authService.getUsernameDisplay();
  }

  public displayLogo(): boolean {
    return this.formRoute !== this.currentRoute;
  }
}
