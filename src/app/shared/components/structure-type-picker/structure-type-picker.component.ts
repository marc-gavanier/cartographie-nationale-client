import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StructureType } from '../../../models/structure-type.model';
import { StructureTypeService } from '../../../services/structure-type.service';
import { ButtonType } from '@gouvfr-anct/mediation-numerique/shared';
import {typeStructureEnum} from '@gouvfr-anct/mediation-numerique';

export enum structureTypes {
  public = 'Publique',
  private = 'Privée à but non lucratif',
  privateLucratif = 'Privée à but lucratif',
}

@Component({
  selector: 'app-structure-type-picker',
  templateUrl: './structure-type-picker.component.html',
  styleUrls: ['./structure-type-picker.component.scss'],
})
export class StructureTypePickerComponent implements OnInit {
  public pickedType: string;
  public structureTypes: StructureType[];
  @Input() public pickedChoice?: string;
  @Output() selectedType: EventEmitter<string> = new EventEmitter<string>();

  // Collapse var
  public showPublic: boolean;
  public showPrivate: boolean;
  public showPrivateLucrative: boolean;

  public buttonTypeEnum = ButtonType;

  constructor(private structureTypeService: StructureTypeService) {}

  ngOnInit() {
    this.structureTypeService.getStructureTypes().subscribe((types) => {
      this.structureTypes = types;
      if (this.pickedChoice) {
        this.pickedType = this.getType(this.pickedChoice);
      }
    });
  }

  public togglePublic(): void {
    this.showPublic = !this.showPublic;
    this.showPrivate = false;
    this.showPrivateLucrative = false;
    if (!this.showPublic) {
      // this.getStructureControl('website').reset();
      // remove to form
    }
    // this.setValidationsForm();
    // add to form
  }
  public togglePrivate(): void {
    this.showPrivate = !this.showPrivate;
    this.showPrivateLucrative = false;
    this.showPublic = false;
    if (!this.showPublic) {
      // this.getStructureControl('website').reset();
      // remove to form
    }
    // this.setValidationsForm();
    // add to form
  }
  public togglePrivateLucrative(): void {
    this.showPrivateLucrative = !this.showPrivateLucrative;
    this.showPrivate = false;
    this.showPublic = false;
    if (!this.showPublic) {
      // this.getStructureControl('website').reset();
      // remove to form
    }
    // this.setValidationsForm();
    // add to form
  }

  public getType(nameChoice: string): string {
    return this.structureTypes.filter((type) => {
      if (type.values.includes(nameChoice)) {
        return type.name;
      }
    })[0].name;
  }

  public getChoices(nameType: string): string[] {
    return this.structureTypes.filter((type) => {
      if (type.name == nameType) {
        return type.values;
      }
    })[0].values;
  }

  public toggleCollapse(structureName: string): void {
    this.pickType(structureName);
    if (structureName === 'Publique') this.togglePublic();
    if (structureName === 'Privée à but non lucratif') this.togglePrivate();
    if (structureName === 'Privée à but lucratif') this.togglePrivateLucrative();
  }

  public pickType(type: string): void {
    this.pickedType = type;
  }

  public pickChoice(choice: string): void {
    this.pickedChoice = choice;
    this.selectedType.emit(choice);
  }

  public getStructureTypeIcon(type: string): string {
    switch (type) {
      case structureTypes.public:
        return 'typeStructure_public';
      case structureTypes.private:
        return 'typeStructure_private';
      case structureTypes.privateLucratif:
        return 'typeStructure_privateLucratif';
      default:
        throw new Error('Structure type not handle');
    }
  }

  public getStructureTypeName(type: string): string {
    return typeStructureEnum[type];
  }
}
