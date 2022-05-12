import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {Day, Structure, Time, Week} from '@gouvfr-anct/mediation-numerique';
import { StructureService } from './structure.service';
const { DateTime } = require('luxon');

describe('StructureService', () => {
  let structureService: StructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StructureService],
    });
    structureService = TestBed.inject(StructureService);
  });

  it('Mise à jour ouverture de la structure : should return true', () => {
    // Init structure avec aucun horaire
    const s: Structure = new Structure();
    s.hours = new Week();
    s.hours.monday = new Day(false);
    s.hours.tuesday = new Day(false);
    s.hours.wednesday = new Day(false);
    s.hours.thursday = new Day(false);
    s.hours.friday = new Day(false);
    s.hours.saturday = new Day(false);
    s.hours.sunday = new Day(false);
    s.hours.thursday.open = true;
    s.hours.thursday.time = new Array(
      new Time({ opening: 805, closing: 1200 }),
      new Time({ opening: 1400, closing: 1600 })
    );

    // Init date sur un jeudi à 9h05
    const dt = new DateTime.local(2020, 10, 8, 9, 5);
    const result = structureService.updateOpeningStructure(s);
    expect(result.isOpen).toEqual(true);
  });

  it('Mise à jour ouverture de la structure : should return false', () => {
    // Init structure avec aucun horaire
    const s: Structure = new Structure();
    s.hours = new Week();
    s.hours.monday = new Day();
    s.hours.tuesday = new Day();
    s.hours.wednesday = new Day();
    s.hours.thursday = new Day();
    s.hours.friday = new Day();
    s.hours.saturday = new Day();
    s.hours.sunday = new Day();

    s.hours.thursday.open = true;
    s.hours.thursday.time = new Array(new Time({ opening: 1400, closing: 1600 }));
    // Init date sur un jeudi à 9h05
    const dt = new DateTime.local(2020, 10, 8, 9, 5);
    const result = structureService.updateOpeningStructure(s);
    expect(result.isOpen).toEqual(false);
  });
});
