import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StructureService } from '../services/structure.service';
import {Structure} from '@gouvfr-anct/mediation-numerique';

@Injectable()
export class StructureResolver implements Resolve<Structure> {
  constructor(private structureService: StructureService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Structure> {
    const structureId = route.params.id;
    return this.structureService.getStructure(structureId).pipe(
      map((res) => res),
      catchError(() => {
        this.router.navigate(['/home']);
        return new Observable<Structure>();
      })
    );
  }
}
