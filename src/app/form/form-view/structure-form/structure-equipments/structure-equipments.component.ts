import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import {Module} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-equipments',
  templateUrl: './structure-equipments.component.html',
  styleUrls: ['./structure-equipments.component.scss'],
})
export class StructureEquipmentsComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() isEditMode: boolean;
  @Input() equipmentsAndServices: { module: Module; openned: boolean }[];
  @Output() validateForm = new EventEmitter<any>();

  private vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

  async ngOnInit(): Promise<void> {
    this.validateForm.emit();
  }

  public getStructureControl(nameControl: string): AbstractControl {
    return this.structureForm.get(nameControl);
  }

  public changeValueHandler(equipment: string, value = 0): void {
    let field = '';
    if (equipment === 'ordinateurs') field = 'nbComputers';
    if (equipment === 'tablettes') field = 'nbTablets';
    if (equipment === 'scanners') field = 'nbScanners';
    if (equipment === 'bornesNumeriques') field = 'nbNumericTerminal';
    if (equipment === 'imprimantes') field = 'nbPrinters';

    if (value === -1 && this.structureForm.value[field] === 0) return;
    this.getStructureControl(field).setValue(this.structureForm.value[field] + value);
  }

  public setValidationsForm() {
    this.validateForm.emit();
  }

  /**
   * Check if first letter is a vowel and returns text with correct preposition
   * @param equipment Equipment
   * @returns "de tablalettres" | "d'imprimantes"
   */
  public formatEquipment(equipment: string): string {
    if (this.vowels.includes(equipment.toLocaleLowerCase()[0])) return `d'${equipment.toLocaleLowerCase()}`;
    return `de ${equipment.toLocaleLowerCase()}`;
  }
}
