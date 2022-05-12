import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { WeekDayEnum } from '../../enum/weekDay.enum';
import { CheckHours } from '../../validator/form';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Day, Time} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-hour-picker',
  templateUrl: './hour-picker.component.html',
  styleUrls: ['./hour-picker.component.scss'],
})
export class HourPickerComponent implements OnChanges, OnDestroy {
  @Input() modifiedFields: any;
  @Input() structureInput: FormGroup;

  @Output() updateFormError = new EventEmitter<any>();
  @Output() updateForm = new EventEmitter<FormGroup>();
  public buttonTypeEnum = ButtonType;
  public error = false;

  private copiedDay: any;
  private isInputSelected = false;
  public copiedDayName = '';
  public structure = {
    hours: this.initHoursDefault(),
  };
  public structureHoursDefault: any[] = this.initHoursDefault();

  ngOnChanges(): void {
    this.formatHoursForEdition();
  }

  ngOnDestroy(): void {
    this.formatHoursForSave();
  }

  public getStructureControl(nameControl: string): AbstractControl {
    return this.structureInput.get(nameControl);
  }

  private initHoursDefault(): any {
    return [
      {
        name: 'Lundi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Mardi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Mercredi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Jeudi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Vendredi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Samedi',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
      {
        name: 'Dimanche',
        hours: [{ start: '', end: '', error: 'incomplete' }],
        open: false,
        active: false,
      },
    ];
  }

  /**
   * Convert data from form to component structure
   */
  private parseFormToHours(day: Day, key: string): void {
    this.structureHoursDefault.forEach((element) => {
      if (element.name.toLowerCase() === key) {
        element.open = day.open;
        element.active = day.open;
        element.hours = day.time
          .map((hour: Time) => {
            if (hour.opening && hour.closing) {
              return {
                start: hour.opening,
                end: hour.closing,
                error: null,
              };
            } else {
              if (hour.opening) {
                return {
                  start: hour.opening,
                  end: '',
                  error: 'incomplete',
                };
              } else {
                return {
                  start: '',
                  end: hour.closing,
                  error: 'incomplete',
                };
              }
            }
          })
          .filter((item) => item);
      }
    });
    this.checkHoursValid();
    this.structure.hours = this.structureHoursDefault;
  }

  private parseToDay(data: {
    name: string;
    hours: { start: string; end: string }[];
    open: boolean;
    active: boolean;
  }): Day {
    return new Day({
      open: data.open,
      time: data.hours.map(
        (hour) =>
          new Time({
            opening: hour.start,
            closing: hour.end,
          })
      ),
    });
  }

  private parseHoursToForm(): FormGroup {
    return new FormGroup({
      monday: this.createDay(this.parseToDay(this.structure.hours[0])),
      tuesday: this.createDay(this.parseToDay(this.structure.hours[1])),
      wednesday: this.createDay(this.parseToDay(this.structure.hours[2])),
      thursday: this.createDay(this.parseToDay(this.structure.hours[3])),
      friday: this.createDay(this.parseToDay(this.structure.hours[4])),
      saturday: this.createDay(this.parseToDay(this.structure.hours[5])),
      sunday: this.createDay(this.parseToDay(this.structure.hours[6])),
    });
  }

  /**
   * Intégrer les horaires dans les horaires par défaut du composant
   */
  public formatHoursForEdition(): void {
    if (this.structureInput) {
      this.parseFormToHours(this.getStructureControl('monday').value, WeekDayEnum.monday);
      this.parseFormToHours(this.getStructureControl('tuesday').value, WeekDayEnum.tuesday);
      this.parseFormToHours(this.getStructureControl('wednesday').value, WeekDayEnum.wednesday);
      this.parseFormToHours(this.getStructureControl('thursday').value, WeekDayEnum.thursday);
      this.parseFormToHours(this.getStructureControl('friday').value, WeekDayEnum.friday);
      this.parseFormToHours(this.getStructureControl('saturday').value, WeekDayEnum.saturday);
      this.parseFormToHours(this.getStructureControl('sunday').value, WeekDayEnum.sunday);
    }
    // this.structure.hours = this.structureHoursDefault;
  }

  /**
   * Formater les horaires pour l'enregistrement en base :
   * supprimer les données inutiles
   */
  public formatHoursForSave(): void {
    if (!this.structure.hours) {
      return;
    }

    this.structure.hours = this.structure.hours.filter((day) => day.open === true);

    for (const day of this.structure.hours) {
      delete day.open;
      delete day.active;
      for (const hour of day.hours) {
        delete hour.error;
      }
    }
  }

  public activateDay(day: any): void {
    day.active = true;
  }

  public toggleOpenDay(day: any, value: any): void {
    day.open = value;
    if (!value) {
      day.hours = [];
    }
    this.submitForm();
  }

  /**
   * Ajouter une ligne d'horaires à un jour
   */
  public addHours(day: any): void {
    if (day.hours.length >= 5) {
      return;
    }

    day.hours.push({
      start: '',
      end: '',
      error: 'incomplete',
    });
    this.submitForm();
  }

  /**
   * Supprimer la dernière ligne d'horaires d'un jour
   */
  public removeHours(day: any, index: number): void {
    if (index > -1) {
      day.hours.splice(index, 1);
    }
  }

  /**
   * Copier les horaires d'un jour pour les coller par dessus les horaires d'un autre jour
   */
  public copy(day): void {
    this.copiedDayName = day.name;
    this.copiedDay = day;
  }

  /**
   * Remplacer les horaires d'un jour par les horaires copiés précédemment
   */
  public paste(day): void {
    day.hours = JSON.parse(JSON.stringify(this.copiedDay.hours));
    day.open = this.copiedDay.open;
  }

  /**
   * Annuler la copie des horaires
   */
  public cancelCopy(): void {
    this.copiedDayName = '';
    this.copiedDay = null;
  }

  /**
   * Vérifier que le format des horaires est correct
   */
  public checkHoursValid(): boolean {
    let error = false;
    for (const day of this.structure.hours) {
      if (day.open) {
        // Init if no data
        if (day.hours.length === 0) {
          this.addHours(day);
        }
        for (const hour of day.hours) {
          if (hour.start === '' || hour.end === '') {
            hour.error = 'incomplete';
            error = true;
          } else if (hour.end <= hour.start) {
            hour.error = 'wrong';
            error = true;
          } else {
            hour.error = null;
          }
        }
      }
    }
    // Émettre l'erreur à ajouter au formulaire pour autoriser
    // ou empêcher de passer à l'étape suivante

    return !error;
  }

  public onFocus(): void {
    this.isInputSelected = true;
  }

  public onBlur(): void {
    this.isInputSelected = false;
    this.submitForm();
  }

  public submitForm(): void {
    if (this.checkHoursValid() && this.isInputSelected === false) {
      this.updateForm.emit(this.parseHoursToForm());
    } else {
      this.updateFormError.emit();
    }
  }

  private createDay(day: Day): FormGroup {
    return new FormGroup({
      open: new FormControl(day.open, Validators.required),
      time: new FormArray(day.time.map((oneTime) => this.createTime(oneTime))) as FormArray,
    });
  }

  private createTime(time: Time): FormGroup {
    return new FormGroup({
      opening: new FormControl(time.opening, Validators.required),
      closing: new FormControl(time.closing, [Validators.required, CheckHours(time.opening)]),
    });
  }
}
