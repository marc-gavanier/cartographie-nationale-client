import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Filter} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-print-header',
  templateUrl: './structure-print-header.component.html',
  styleUrls: ['./structure-print-header.component.scss'],
})
export class StructurePrintHeaderComponent implements OnInit {
  @Input() public beneficiaryNeedCommentary: string | null;
  @Input() public beneficiaryName: string | null;
  @Input() public structureAccompaniment: string;
  @Input() public beneficiaryPassNumeric: boolean;
  @Input() public contactAccompaniment: string | null;
  @Input() public contactAccompanimentPhone: string | null;
  @Input() public filters: Filter[];

  public date: string;
  public formations: Filter[] = [];
  public assistances: Filter[] = [];
  public equipments: Filter[] = [];
  public specificNeeds: Filter[] = [];

  constructor(private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.date = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    this.filters.forEach((elem) => {
      switch (elem.name) {
        case 'proceduresAccompaniment':
          this.assistances.push(elem);
          break;
        case 'publicsAccompaniment':
          this.specificNeeds.push(elem);
          break;
        case 'equipmentsAndServices':
          this.equipments.push(elem);
          break;
        case 'accessRight':
          this.formations.push(elem);
          break;
        case 'baseSkills':
          this.formations.push(elem);
          break;
        case 'socialAndProfessional':
          this.formations.push(elem);
          break;
        case 'parentingHelp':
          this.formations.push(elem);
          break;
        case 'digitalCultureSecurity':
          this.formations.push(elem);
          break;

        default:
          break;
      }
    });
  }
}
