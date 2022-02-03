import { LOCALE_ID, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { CartoComponent } from './carto/carto.component';
import { CustomBreakPointsProvider } from './config/custom-breakpoint';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { MapModule } from './map/map.module';
import { StructureListComponent } from './structure-list/structure-list.component';
import { CardComponent } from './structure-list/components/card/card.component';
import { StructureListSearchComponent } from './structure-list/components/structure-list-search/structure-list-search.component';
import { StructureDetailsComponent } from './structure-list/components/structure-details/structure-details.component';
import { StructureOpeningStatusComponent } from './structure-list/components/structure-opening-status/structure-opening-status.component';
import { ModalFilterComponent } from './structure-list/components/modal-filter/modal-filter.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PageComponent } from './page/page.component';
import { ContactComponent } from './contact/contact.component';
import { FormComponent } from './form/structure-form/form.component';
import { UserVerificationComponent } from './user-verification/user-verification.component';
import { AuthGuard } from './guards/auth.guard';
import { CustomHttpInterceptor } from './config/http-interceptor';
import { ResetEmailComponent } from './reset-email/reset-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminGuard } from './guards/admin.guard';
import { DeactivateGuard } from './guards/deactivate.guard';
import { FooterFormComponent } from './form/footer-form/footer-form.component';
import { TempUserResolver } from './resolvers/temp-user.resolver';
import { StructureJoinComponent } from './structure-join/structure-join.component';
import { RouterListenerService } from './services/routerListener.service';
import { NewsletterSubscriptionComponent } from './newsletter-subscription/newsletter-subscription.component';
import { OrientationFormComponent } from './form/orientation-form/orientation-form.component';
import { StructureDetailPrintComponent } from './form/orientation-form/component/structure-detail-print/structure-detail-print.component';
import { StructureListPrintComponent } from './form/orientation-form/component/structure-list-print/structure-list-print.component';
import { StructurePrintHeaderComponent } from './form/orientation-form/component/structure-print-header/structure-print-header.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { StructureResolver } from './resolvers/structure.resolver';
import { RoleGuard } from './guards/role.guard';
import { UpdateService } from './services/update.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CartoComponent,
    StructureListComponent,
    CardComponent,
    StructureListSearchComponent,
    ModalFilterComponent,
    StructureDetailsComponent,
    StructureOpeningStatusComponent,
    LegalNoticeComponent,
    PageComponent,
    ContactComponent,
    UserVerificationComponent,
    ResetEmailComponent,
    ResetPasswordComponent,
    FormComponent,
    FooterFormComponent,
    StructureJoinComponent,
    NewsletterSubscriptionComponent,
    OrientationFormComponent,
    StructureDetailPrintComponent,
    StructureListPrintComponent,
    StructurePrintHeaderComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    MapModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    CustomBreakPointsProvider,
    AuthGuard,
    AdminGuard,
    RoleGuard,
    DeactivateGuard,
    TempUserResolver,
    StructureResolver,
    RouterListenerService,
    UpdateService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
