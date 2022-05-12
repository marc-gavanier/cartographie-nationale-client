import { Component, Input } from '@angular/core';
import {Filter, Structure} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-list-print',
  templateUrl: './structure-list-print.component.html',
  styleUrls: ['./structure-list-print.component.scss'],
})
export class StructureListPrintComponent {
  @Input() public structures: Structure[];
  @Input() public filters: Filter[];
  @Input() public beneficiaryNeedCommentary: string;
  @Input() public beneficiaryName: string;
  @Input() public structureAccompaniment: string;
  @Input() public beneficiaryPassNumeric: boolean;
  @Input() public contactAccompaniment: string;
}
