import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';

@Component({
  selector: 'app-navigation-buttons',
  templateUrl: './navigation-buttons.component.html',
  styleUrls: ['./navigation-buttons.component.scss'],
})
export class NavigationButtonsComponent {
  @Input() buttonStyle = 0;
  @Output() goNext = new EventEmitter<any>();
  public buttonTypeEnum = ButtonType;
  constructor(private router: Router) {}

  public goToHome(): void {
    this.router.navigateByUrl('news');
  }

  public goToNextPage(): void {
    this.goNext.emit();
  }
}
