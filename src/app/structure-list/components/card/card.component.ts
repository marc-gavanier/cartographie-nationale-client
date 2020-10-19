import { Component, Input, OnInit } from '@angular/core';
import { Filter } from '../../models/filter.model';
import { Structure } from '../../models/structure.model';
import { StructureService } from '../../services/structure-list.service';
const { DateTime } = require('luxon');

@Component({
  selector: 'app-structure-list-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  structures: Structure[] = [];
  @Input() filter: Filter[];
  constructor(private structureService: StructureService) {}

  ngOnInit(): void {
    this.getStructures(null);
  }
  ngOnChanges(): void {
    let filters: Filter[] = [];
    if (this.filter) {
      filters = this.filter;
      this.getStructures(filters);
    }
  }

  public getStructures(filters): void {
    this.structureService.getStructures(filters).subscribe((structures) => {
      this.structures = [];
      structures.forEach((s: Structure) => {
        this.structures.push(this.structureService.updateOpeningStructure(s, DateTime.local()));
      });
    });
  }
}
