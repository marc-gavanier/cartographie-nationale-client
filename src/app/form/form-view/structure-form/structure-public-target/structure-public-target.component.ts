import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Category} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-structure-public-target',
  templateUrl: './structure-public-target.component.html',
})
export class StructurePublicTargetComponent implements OnInit {
  @Input() structureForm: FormGroup;
  @Input() publics: Category;
  @Output() updateChoice = new EventEmitter<any>();
  @Output() validateForm = new EventEmitter<any>();

  public buttonTypeEnum = ButtonType;

  ngOnInit(): void {
    this.validateForm.emit();
  }

  public updateChoicePublic(choice: string) {
    this.updateChoice.emit({ formControlName: 'publics', choice });
  }

  public isInArray(choice: string) {
    if (this.structureForm.get('publics') && this.structureForm.get('publics').value.includes(choice)) return true;
    return false;
  }
}
