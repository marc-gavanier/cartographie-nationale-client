import { Component } from '@angular/core';
import { ProfileService } from './profile/services/profile.service';
import { AuthService } from './services/auth.service';
import { RouterListenerService } from './services/routerListener.service';
import { PrintService } from './shared/service/print.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'pamn';

  constructor(
    public printService: PrintService,
    private authService: AuthService,
    private profilService: ProfileService,
    private routerListenerService: RouterListenerService
  ) {
    if (this.authService.isLoggedIn()) {
      this.profilService.getProfile();
    }
  }
}
