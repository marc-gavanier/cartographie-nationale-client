import { Component, Input, OnInit } from '@angular/core';
import { Demarches } from '../../enum/demarches.enum';

// todo: to remove
export enum Labels {
  passNumerique = 'Pass numérique',
  maisonFranceService = 'Maison france service',
  aidantsConnect = 'Aidants connect',
  fabriqueDeTerritoire = 'Fabrique de territoire',
  demarcheMetropolitaine = 'Démarches Métropolitaines',
  pix = 'Évaluation des compétences numériques',
  conseillerNumFranceServices = 'Conseiller numérique'
}

@Component({
  selector: 'app-logo-card',
  templateUrl: './logo-card.component.html',
  styleUrls: ['./logo-card.component.scss'],
})
export class LogoCardComponent implements OnInit {
  @Input() public logoPath: string;
  @Input() public name: string;

  constructor() {}

  ngOnInit(): void {}

  public getName(key: string): string {
    if (Labels[key]) {
      return Labels[key];
    } else {
      return Demarches[key];
    }
  }
}
