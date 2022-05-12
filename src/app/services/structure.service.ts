import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WeekDay } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
const { DateTime } = require('luxon');

import { User } from '../models/user.model';
import { StructureWithOwners } from '../models/structureWithOwners.model';
import { TempUser } from '../models/temp-user.model';
import {Day, Filter, OpeningDay, Structure, Time, Weekday} from '@gouvfr-anct/mediation-numerique';

@Injectable({
  providedIn: 'root',
})
export class StructureService {
  private readonly baseUrl = 'api/structures';
  constructor(private http: HttpClient) {}

  public updateStructureAfterOwnerVerify(idStructure: string, user: User): Observable<any> {
    const emailUser = user.email;
    return this.http
      .put(`${this.baseUrl}/updateAfterOwnerVerify/${idStructure}`, { emailUser })
      .pipe(map((item: Structure) => new Structure(item)));
  }
  public createStructure(structure: Structure, profile: User): Observable<Structure> {
    const idUser = profile.email;
    return this.http.post(`${this.baseUrl}`, { structure, idUser }).pipe(map((item: Structure) => new Structure(item)));
  }

  public editStructure(structure: Structure): Observable<Structure> {
    structure.updatedAt = new Date().toString();
    if (structure.dataShareConsentDate) {
      structure.dataShareConsentDate = new Date().toString();
    } else {
      structure.dataShareConsentDate = null;
    }
    const id = structure._id;
    delete structure._id; // id should not be provided for update
    return this.http.put(`${this.baseUrl}/${id}`, structure).pipe(map((item: Structure) => new Structure(item)));
  }

  public isClaimed(id: string, profile: User): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${id}/isClaimed`, profile);
  }

  public claimStructureWithAccount(id: string, email: string): Observable<string[]> {
    return this.http.post<any>(`${this.baseUrl}/${id}/claim`, { email });
  }

  public getStructure(id: string): Observable<Structure> {
    return this.http.get<Structure>(`${this.baseUrl}/${id}`);
  }

  public validateStructureJoin(id: string, userId: string, state: boolean): Observable<Structure> {
    return this.http.post<any>(`${this.baseUrl}/${id}/join/${userId}/${state}`, null);
  }

  public joinStructure(id: string, email: string): Observable<Structure> {
    return this.http.post<any>(`${this.baseUrl}/${id}/join`, { email });
  }

  public delete(id: string): Observable<Structure> {
    return this.http.delete<Structure>(`${this.baseUrl}/${id}`);
  }

  public removeOwnerFromStructure(idOwner: string, idStructure: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${idStructure}/owner/${idOwner}`);
  }
  public addOwnerToStructure(user: TempUser, idStructure: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idStructure}/addOwner`, user);
  }

  public getStructuresByName(filters: Filter[]): Observable<Structure[]> {
    return this.getStructures(filters, 'searchByName');
  }

  public getStructures(filters: Filter[], searchUrl: string = 'search'): Observable<Structure[]> {
    if (filters && filters.length > 0) {
      let requestUrl = `${this.baseUrl}/${searchUrl}`;
      const queryString = _.find(filters, { name: 'query' });
      if (queryString) {
        _.remove(filters, { name: 'query' });
        requestUrl += `?query=${queryString.value}`;
      }
      const formatedFilters = this.formatFilters(filters);
      return this.http
        .post(requestUrl, { filters: formatedFilters })
        .pipe(map((data: any[]) => data.map((item) => new Structure(item))));
    } else {
      return this.http.get(`${this.baseUrl}`).pipe(map((data: any[]) => data.map((item) => new Structure(item))));
    }
  }

  private formatFilters(filters: Filter[]): object {
    return filters.map((filter) => {
      return { [filter.name]: filter.value };
    });
  }

  /**
   * Update opening hours of structure
   * @param structure Structure model
   */
  public updateOpeningStructure(structure: Structure): Structure {
    // Get current day of week
    const currentDate = DateTime.local();
    const dayOfWeek: number = currentDate.weekday;

    // Get the schedules of a structure according to his day to indicate if it's open
    const structureSchedules: Day = structure.getDayhours(dayOfWeek);

    structure.isOpen = false;
    if (structureSchedules.open) {
      structureSchedules.time.forEach((period: Time) => {
        if (this.compareSchedules(period.opening, period.closing, currentDate)) {
          structure.isOpen = true;
        }
      });
    }
    structure.openedOn = this.getNextOpening(structure, dayOfWeek, currentDate); //TODO:
    return structure;
  }

  /**
   * Checks if the current time is in the time interval of the structure
   * @param startTime start of period
   * @param endTime end of period
   * @param currentTime actual time
   */
  private compareSchedules(startTime: string, endTime: string, currentTime: typeof DateTime): boolean {
    const day = currentTime.toISO().split('T')[0];
    let start = DateTime.fromISO(`${day}T${startTime}`);
    if (startTime.length === 4) {
      start = DateTime.fromISO(`${day}T0${startTime}`);
    }
    const end = DateTime.fromISO(`${day}T${endTime}`);
    return currentTime > start && currentTime < end;
  }

  // Get enum key
  private getEnumKeyByEnumValue(enumBase, enumValue): number {
    let keys = Object.keys(enumBase).filter((x) => {
      if (enumBase[x].toString().toLowerCase() == enumValue) {
        return x;
      }
    });
    return keys.length > 0 ? parseInt(keys[0]) : null;
  }

  private getNextOpening(s: Structure, dayOfWeek: number, currentTime: typeof DateTime): OpeningDay {
    let periodBeforeCurrentDay = null;
    const time = currentTime.toISO().split('T')[1];
    const currentHour = new Date('1/1/1999 ' + time.split('+')[0]);

    // Browse day of week
    for (const [i, period] of Object.entries(s.hours)) {
      if (period.open) {
        // Check if it's current day
        if (i === this.numberToDay(dayOfWeek)) {
          if (
            (new Date('1/1/1999 ' + period.time[0].opening) <= currentHour &&
              new Date('1/1/1999 ' + period.time[0].closing) >= currentHour) ||
            (period.time[1] &&
              new Date('1/1/1999 ' + period.time[1].opening) <= currentHour &&
              new Date('1/1/1999 ' + period.time[1].closing) >= currentHour)
          ) {
            return new OpeningDay(i, null);
          } else if (new Date('1/1/1999 ' + period.time[0].opening) > currentHour) {
            return new OpeningDay(i, this.numberToHour(period.time[0].opening));
          } else if (period.time[1] && new Date('1/1/1999 ' + period.time[1].opening) > currentHour) {
            return new OpeningDay(i, this.numberToHour(period.time[1].opening));
          }
          // Return the next day > current day.
        } else if (
          this.getEnumKeyByEnumValue(WeekDay, i) > this.getEnumKeyByEnumValue(WeekDay, this.numberToDay(dayOfWeek))
        ) {
          return new OpeningDay(i, this.numberToHour(period.time[0].opening));
          // Return the next day < current day.
        } else if (!periodBeforeCurrentDay) {
          periodBeforeCurrentDay = new OpeningDay(i, this.numberToHour(period.time[0].opening));
        }
      }
    }
    return periodBeforeCurrentDay ? periodBeforeCurrentDay : '';
  }

  private numberToDay(n: number): string {
    return Weekday[n];
  }

  private numberToHour(n: string): string {
    return n.replace(':', 'h');
  }

  public getStructureWithOwners(structureId: string, profile: User): Observable<StructureWithOwners> {
    return this.http.post<any>(`${this.baseUrl}/${structureId}/withOwners`, { emailUser: profile?.email });
  }

  public sendMailOnStructureError(structureId: string, content: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reportStructureError`, {
      structureId,
      content,
    });
  }
}
