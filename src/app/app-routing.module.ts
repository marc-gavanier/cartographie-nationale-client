import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { PageComponent } from './page/page.component';
import { ContactComponent } from './contact/contact.component';
import { FormComponent } from './form/structure-form/form.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { DeactivateGuard } from './guards/deactivate.guard';
import { CartoComponent } from './carto/carto.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { ResetEmailComponent } from './reset-email/reset-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TempUserResolver } from './resolvers/temp-user.resolver';
import { StructureJoinComponent } from './structure-join/structure-join.component';
import { NewsletterSubscriptionComponent } from './newsletter-subscription/newsletter-subscription.component';
import { OrientationFormComponent } from './form/orientation-form/orientation-form.component';
import { StructureListPrintComponent } from './form/orientation-form/component/structure-list-print/structure-list-print.component';
import { StructureResolver } from './resolvers/structure.resolver';
import { RoleGuard } from './guards/role.guard';
import { RouteRole } from './shared/enum/routeRole.enum';
import { LoginComponent } from './login/login.component';
import { PasswordFormComponent } from './shared/components';
import { FooterComponent } from './footer/footer.component';
import {StructureDetailsComponent} from '@gouvfr-anct/mediation-numerique';

const footerOutletRoute: Route = {
  path: '',
  outlet: 'footer',
  component: FooterComponent,
};

const routes: Routes = [
  {
    path: 'print',
    outlet: 'print',
    children: [{ path: 'structure', component: StructureDetailsComponent }, footerOutletRoute],
  },
  {
    path: 'print',
    outlet: 'print',
    children: [{ path: 'structures', component: StructureListPrintComponent }, footerOutletRoute],
  },
  {
    path: 'orientation',
    children: [
      {
        path: '',
        component: OrientationFormComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'acteurs',
    component: CartoComponent,
  },
  {
    path: 'login',
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'legal-notice',
    children: [
      {
        path: '',
        component: LegalNoticeComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'page/:slugPage',
    children: [
      {
        path: '',
        component: PageComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'contact',
    children: [
      {
        path: '',
        component: ContactComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'users/verify/:id',
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'register',
    children: [
      {
        path: '',
        component: FormComponent,
        canDeactivate: [DeactivateGuard],
        resolve: {
          user: TempUserResolver,
        },
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'change-email/:id',
    children: [
      {
        path: '',
        component: ResetEmailComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'profile',
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'join',
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        component: StructureJoinComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'reset-password',
    children: [
      {
        path: '',
        component: ResetPasswordComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'new-password',
    component: PasswordFormComponent,
  },
  {
    path: 'create-structure',
    children: [
      {
        path: '',
        component: FormComponent,
        canDeactivate: [DeactivateGuard],
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'create-structure/:id',
    children: [
      {
        path: '',
        component: FormComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [RoleGuard],
        data: { allowedRoles: [RouteRole.structureAdmin] },
        resolve: {
          structure: StructureResolver,
        },
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'newsletter',
    children: [
      {
        path: '',
        component: NewsletterSubscriptionComponent,
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'newsletter-unsubscribe',
    children: [
      {
        path: '',
        component: NewsletterSubscriptionComponent,
      },
      footerOutletRoute,
    ],
  },

  {
    path: 'news',
    children: [
      {
        path: '',
        loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        canActivate: [AdminGuard],
        loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
      },
      footerOutletRoute,
    ],
  },
  {
    path: 'form',
    loadChildren: () => import('./form/form-view/form-view.module').then((m) => m.FormViewModule),
  },
  {
    path: 'home',
    redirectTo: 'news',
  },
  {
    path: '**',
    redirectTo: 'news',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
