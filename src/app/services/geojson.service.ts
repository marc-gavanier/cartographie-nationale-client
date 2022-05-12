import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import {GeoJson} from '@gouvfr-anct/mediation-numerique';

@Injectable({
  providedIn: 'root',
})
export class GeojsonService {
  constructor(private http: HttpClient) {}

  /**
   * Retrive an address by geolocation
   * @param idVoie Number
   */
  public getAddressByCoord(longitude: number, latitude: number): Observable<any> {
    return this.http
      .get('/reverse/' + '?lon=' + longitude + '&lat=' + latitude, { headers: { skip: 'true' } })
      .pipe(map((data: { features: any[] }) => new GeoJson(data.features[0])));
  }

  /**
   * Parse object to geojosn
   * @param data string data
   */
  private parseToGeoJson(data: string): GeoJson {
    return new GeoJson(data);
  }

  /**
   * Retrive an address by geolocation
   * @param idVoie Number
   */
  public getMDMGeoJson(): Observable<GeoJson[]> {
    return this.http
      .get(
        '/wfs/grandlyon' +
          '?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=ter_territoire.maison_de_la_metropole&outputFormat=application/json; subtype=geojson&SRSNAME=EPSG:4171&startIndex=0',
        { headers: { skip: 'true' } }
      )
      .pipe(map((data: { features: any[] }) => _.map(data.features, this.parseToGeoJson)));
  }

  /**
   * Get GeoLocation with an address
   * @param address Address
   */
  public getCoord(numero: string, address: string, zipcode: string): Observable<GeoJson> {
    return this.http
      .get('/geocoding/photon/api' + '?q=' + numero + ' ' + address + ' ' + zipcode, { headers: { skip: 'true' } })
      .pipe(map((data: { features: any[]; type: string }) => new GeoJson(data.features[0])));
  }

  public getTownshipCoord(town: string): Observable<Array<any>> {
    return this.http.get<Array<any>>(`/api/structures/coordinates/` + town);
  }

  // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  // :::                                                                         :::
  // :::  This routine calculates the distance between two points (given the     :::
  // :::  latitude/longitude of those points). It is being used to calculate     :::
  // :::  the distance between two locations using GeoDataSource (TM) prodducts  :::
  // :::                                                                         :::
  // :::  Definitions:                                                           :::
  // :::    South latitudes are negative, east longitudes are positive           :::
  // :::                                                                         :::
  // :::  Passed to function:                                                    :::
  // :::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
  // :::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
  // :::    unit = the unit you desire for results                               :::
  // :::           where: 'M' is statute miles (default)                         :::
  // :::                  'K' is kilometers                                      :::
  // :::                  'N' is nautical miles                                  :::
  // :::                                                                         :::
  // :::  Worldwide cities and other features databases with latitude longitude  :::
  // :::  are available at https://www.geodatasource.com                         :::
  // :::                                                                         :::
  // :::  For enquiries, please contact sales@geodatasource.com                  :::
  // :::                                                                         :::
  // :::  Official Web site: https://www.geodatasource.com                       :::
  // :::                                                                         :::
  // :::               GeoDataSource.com (C) All Rights Reserved 2018            :::
  // :::                                                                         :::
  // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  public getDistance(lat1, lon1, lat2, lon2, unit): string {
    if (lat1 === lat2 && lon1 === lon2) {
      return '0';
    } else {
      const radlat1 = (Math.PI * lat1) / 180;
      const radlat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radtheta = (Math.PI * theta) / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit === 'K') {
        dist = dist * 1.609344;
      }
      if (unit === 'M') {
        dist = dist * 1.609344 * 1000;
      }
      if (unit === 'N') {
        dist = dist * 0.8684;
      }
      return dist.toFixed(0);
    }
  }
}
