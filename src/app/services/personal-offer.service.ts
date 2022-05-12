import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PersonalOffer } from '@gouvfr-anct/mediation-numerique';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersonalOfferService {
  constructor(private http: HttpClient) {}

  public createPersonalOffer(structureId: string, personalOffer: PersonalOffer): Observable<any> {
    return this.http.post<any>(`api/personal-offers/`, { structureId: structureId, personalOffer: personalOffer });
  }
}
