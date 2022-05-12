import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedComponents } from './components';
import { SharedPipes } from './pipes';
import { AddressAutocompleteComponent } from './components/address-autocomplete/address-autocomplete.component';
import { HourPickerComponent } from './components/hour-picker/hour-picker.component';
import {
  ButtonModule,
  DayModule,
  ModalModule,
  PhoneModule,
  SvgIconModule,
  TextInputModalModule
} from '@gouvfr-anct/mediation-numerique/shared';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ButtonModule,
    SvgIconModule,
    TextInputModalModule,
    ModalModule,
    DayModule,
    PhoneModule
  ],
  declarations: [
    ...SharedPipes,
    ...SharedComponents,
    AddressAutocompleteComponent,
    HourPickerComponent,
  ],
  exports: [
    ...SharedPipes,
    ...SharedComponents,
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SvgIconModule,
    TextInputModalModule,
    ModalModule,
    DayModule,
    PhoneModule
  ],
})
export class SharedModule {}
