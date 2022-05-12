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
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PageComponent } from './page/page.component';
import { ContactComponent } from './contact/contact.component';
import { FormComponent } from './form/structure-form/form.component';
import { AuthGuard } from './guards/auth.guard';
import { CustomHttpInterceptor } from './config/http-interceptor';
import { ResetEmailComponent } from './reset-email/reset-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminGuard } from './guards/admin.guard';
import { DeactivateGuard } from './guards/deactivate.guard';
import { TempUserResolver } from './resolvers/temp-user.resolver';
import { StructureJoinComponent } from './structure-join/structure-join.component';
import { RouterListenerService } from './services/routerListener.service';
import { NewsletterSubscriptionComponent } from './newsletter-subscription/newsletter-subscription.component';
import { OrientationFormComponent } from './form/orientation-form/orientation-form.component';
import { StructureDetailPrintComponent } from './form/orientation-form/component/structure-detail-print/structure-detail-print.component';
import { StructureListPrintComponent } from './form/orientation-form/component/structure-list-print/structure-list-print.component';
import { StructurePrintHeaderComponent } from './form/orientation-form/component/structure-print-header/structure-print-header.component';
import { OrientationComponent } from './form/orientation-form/component/orientation-modal/orientation-modal.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { StructureResolver } from './resolvers/structure.resolver';
import { RoleGuard } from './guards/role.guard';
import { UpdateService } from './services/update.service';
import { DataShareConsentComponent } from './shared/components/data-share-consent/data-share-consent.component';
import { FormViewModule } from './form/form-view/form-view.module';
import { LoginComponent } from './login/login.component';
import {GeometryPolygonConfiguration, MapModule, StructureModule} from '@gouvfr-anct/mediation-numerique';
import {GeojsonService} from './services/geojson.service';
import {MarkerType} from './config/map/marker-type';
import {ZoomLevel} from './config/map/zoomLevel.enum';
import {InitialPosition} from './config/map/initial-position';
import metropole from '../assets/geojson/metropole.json';
import {SearchService} from './structure-list/services/search.service';
import {StructureService} from './services/structure.service';
import {TclAccessComponent} from './structure/components/tcl-access/tcl-access.component';
import {StructureDetailsModalsComponent} from './structure/components/structure-details-modals/structure-details-modals.component';
import {StructureDetailsActionsComponent} from './structure/components/structure-details-actions/structure-details-actions.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CartoComponent,
    LegalNoticeComponent,
    PageComponent,
    ContactComponent,
    ResetEmailComponent,
    ResetPasswordComponent,
    FormComponent,
    StructureJoinComponent,
    NewsletterSubscriptionComponent,
    OrientationFormComponent,
    StructureDetailPrintComponent,
    StructureListPrintComponent,
    StructurePrintHeaderComponent,
    DataShareConsentComponent,
    OrientationComponent,
    LoginComponent,
    TclAccessComponent,
    StructureDetailsModalsComponent,
    StructureDetailsActionsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    MapModule.forRoot(metropole as GeometryPolygonConfiguration, ZoomLevel, InitialPosition, MarkerType, GeojsonService),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    StructureModule.forRoot(SearchService, StructureService),
    FormViewModule,
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
