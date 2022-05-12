import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import decode from 'jwt-decode';
import { UserRole } from '../../shared/enum/userRole.enum';
import { AuthService } from '../../services/auth.service';
import { Employer } from '../../models/employer.model';
import { Job } from '../../models/job.model';
import {Structure} from '@gouvfr-anct/mediation-numerique';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly baseUrl = 'api/users';
  private currentProfile: User = null;
  constructor(private http: HttpClient, private authService: AuthService) {}

  public async getProfile(): Promise<User> {
    if (this.authService.isLoggedIn()) {
      const profile = await this.http.get<User>(`${this.baseUrl}/profile`).toPromise();
      this.currentProfile = profile;
    }
    return this.currentProfile;
  }

  public setProfile(profile: User): void {
    this.currentProfile = profile;
  }
  public deleteProfile(): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}`);
  }

  public isLinkedToStructure(idStructure: string): boolean {
    if (!this.currentProfile) {
      return false;
    }
    return this.currentProfile.structuresLink.includes(idStructure);
  }

  public isPendingLinkedToStructure(idStructure: string): boolean {
    if (!this.currentProfile) {
      return false;
    }
    return this.currentProfile.pendingStructuresLink.includes(idStructure);
  }

  public removeProfile(): void {
    this.currentProfile = null;
  }

  public createUserandLinkStructure(id: string, body: User): Observable<User> {
    body.pendingStructuresLink = [id];
    return this.http.post<any>(`${this.baseUrl}`, body);
  }

  public isAdmin(): boolean {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.userValue;
      const token = user.accessToken;
      // decode the token to get its payload
      const tokenPayload: User = decode(token);
      if (tokenPayload.role == UserRole.admin) {
        return true;
      }
      return false;
    }
    return false;
  }

  public changePassword(newPassword: string, oldPassword: string): Observable<User> {
    return this.http.post<any>(`${this.baseUrl}/change-password`, { newPassword, oldPassword });
  }
  public verifyAndUpdateEmail(token: string): Observable<User> {
    return this.http.post<any>(`${this.baseUrl}/verify-change-email`, null, {
      params: { token },
    });
  }
  public changeEmail(newEmail: string, oldEmail: string): Observable<User> {
    return this.http.post<any>(`${this.baseUrl}/change-email`, { newEmail, oldEmail });
  }

  public isEmailAlreadyUsed(newMail: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/verify-exist-user`, { newMail });
  }

  public getAllDataConsentPendingStructures(): Observable<Structure[]> {
    return this.http.get<Structure[]>(`${this.baseUrl}/dataConsentValidation`);
  }

  public getEmployers(searchString: string): Observable<Employer[]> {
    return this.http.get<Employer[]>(`api/employer?search=${searchString}`);
  }

  public getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`api/jobs`);
  }

  public createJob(value: Job): Observable<Job> {
    return this.http.post<Job>(`api/jobs`, value);
  }

  public createEmployer(value: Employer): Observable<Employer> {
    return this.http.post<Employer>(`api/employer`, value);
  }

  public updateProfile(employerName: string, jobName: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/profile`, { employerName, jobName });
  }
}
