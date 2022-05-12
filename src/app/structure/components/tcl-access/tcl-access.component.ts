import { Component, Input, OnInit } from '@angular/core';
import { Structure } from '@gouvfr-anct/mediation-numerique';
import {TclService} from '../../../services/tcl.service';

export class TclStopPoint {
  public name: string;
  public tramLines: string[];
  public subLines: string[];
  public busLines: string[];
  public _id: string;
  public id: string;

  constructor(obj?: any) {
    Object.assign(this, obj);
  }
}

@Component({
  selector: 'app-tcl-access',
  templateUrl: 'tcl-access.component.html'
})
export class TclAccessComponent implements OnInit {
  @Input() public structure: Structure;

  public tclStopPoints: TclStopPoint[] = [];

  public constructor(private tclService: TclService) {}

  public async ngOnInit(): Promise<void> {
    this.getTclStopPoints();
  }

  public getTclStopPoints(): void {
    this.tclService.getTclStopPointBycoord(this.structure.getLon(), this.structure.getLat()).subscribe((res) => {
      this.tclStopPoints = res;
    });
  }
}
