import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Structure } from '../../../models/structure.model';
import { GeojsonService } from '../../../services/geojson.service';
import { typeStructureEnum } from '../../../shared/enum/typeStructure.enum';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() public structure: Structure;
  @Output() public showDetails: EventEmitter<Structure> = new EventEmitter<Structure>();
  @Output() public hover: EventEmitter<Structure> = new EventEmitter<Structure>();

  constructor(private geoJsonService: GeojsonService) {}
  ngOnInit(): void {}

  /**
   * Display distance in m or km according to value
   */
  public formatDistance(): string {
    if (this.structure.distance > 1000) {
      return (this.structure.distance / 1000).toFixed(1).toString() + ' km';
    } else {
      return this.structure.distance + ' m';
    }
  }

  public cardClicked(): void {
    this.showDetails.emit(this.structure);
  }

  public getLabelTypeStructure(typeStructure: string[]): string {
    let label = '';
    for (let i = 0; i < typeStructure.length; i++) {
      if (label) {
        label += ', ';
      }
      label += typeStructureEnum[typeStructure[i]];
    }
    return label;
  }
  public cardHover(): void {
    this.hover.emit(this.structure);
  }
}
