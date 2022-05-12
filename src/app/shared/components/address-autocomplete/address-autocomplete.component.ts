import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Address } from '@gouvfr-anct/mediation-numerique';
import { AddressService } from '../../service/address.service';

@Component({
  selector: 'app-address-autocomplete',
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss'],
})
export class AddressAutocompleteComponent implements OnInit {
  public readonly AUTOCOMPLETE_NBR = 5;
  public data = [];
  public isAlreadySearching = false;
  @ViewChild('searchAddress', { static: true }) searchAddress: ElementRef;
  @Output() selectedAddress: EventEmitter<Address> = new EventEmitter<Address>();
  @Output() inputAddress: EventEmitter<any> = new EventEmitter<any>();
  @Input() private address?: Address;

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.lauchSearch();
  }

  ngOnChanges(): void {
    this.lauchSearch();
  }

  public lauchSearch(): void {
    if (this.address) {
      let address_str = null;
      if (this.address.numero) {
        address_str = this.address.numero + ' ' + this.address.street + ' ' + this.address.commune;
      } else {
        address_str = this.address.street + ' ' + this.address.commune;
      }
      this.searchAddress.nativeElement.value = address_str;
    }
  }

  public onSearchChange(searchString: string) {
    if (!this.isAlreadySearching) {
      this.isAlreadySearching = true;
      this.addressService.searchAddress(searchString).subscribe((data) => {
        data.features = data.features.map((el) => {
          el.displayedName = this.parseHitToAddress(el);
          return el;
        });
        // Filtering duplicate displayed string. This duplication is caused by the API used for gathering addresse info.
        this.data = [...new Map(data.features.map((item) => [item['displayedName'], item])).values()];
        this.isAlreadySearching = false;
      });
    }
    this.inputAddress.emit();
  }

  public selectedResult(hit: any): void {
    const address = new Address();
    address.numero = hit.properties.housenumber ? hit.properties.housenumber : null;
    address.commune = hit.properties.city;
    address.coordinates = hit.geometry.coordinates;
    if (hit.properties.street) {
      address.street = hit.properties.street;
    } else {
      address.street = hit.properties.name;
    }
    const value = this.parseHitToAddress(hit);
    // Set input value
    this.searchAddress.nativeElement.value = value;
    // Reset autocomplete
    this.data = [];
    // Emit choosen value
    this.selectedAddress.emit(address);
  }

  private parseHitToAddress(hit: any): string {
    let parsedAddress = '';
    if (hit.properties.housenumber) {
      parsedAddress += `${hit.properties.housenumber} `;
    }
    if (hit.properties.street) {
      parsedAddress += `${hit.properties.street}, `;
    } else {
      parsedAddress += `${hit.properties.name}, `;
    }
    parsedAddress += `${hit.properties.city}`;
    return parsedAddress;
  }
}
