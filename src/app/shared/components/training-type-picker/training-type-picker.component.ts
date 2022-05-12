import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchService } from '../../../structure-list/services/search.service';
import { cloneDeep, remove } from 'lodash';
import {ButtonType} from '@gouvfr-anct/mediation-numerique/shared';
import {Category, Module} from '@gouvfr-anct/mediation-numerique';

@Component({
  selector: 'app-training-type-picker',
  templateUrl: './training-type-picker.component.html',
  styleUrls: ['./training-type-picker.component.scss'],
})
export class TrainingTypePickerComponent implements OnInit {
  @Input() public baseSkills: string[];
  @Input() public accessRight: string[];
  @Input() public digitalCultureSecurity: string[];
  @Input() public socialAndProfessional: string[];
  @Input() public parentingHelp: string[];
  @Output() selectedType: EventEmitter<Category[]> = new EventEmitter<Category[]>();

  public buttonTypeEnum = ButtonType;
  public categories: Category[] = [];
  public categoriesExpanded: string[] = [];
  public selectedChoices: Category[] = [];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.getCategoriesTraining().subscribe((categories) => {
      this.categories = categories;
      this.selectedChoices = cloneDeep(categories);
      this.selectedChoices.forEach((cat) => {
        let selectedModulesId: string[] = [];
        switch (cat.id) {
          case 'accessRight':
            selectedModulesId = this.accessRight;
            break;
          case 'socialAndProfessional':
            selectedModulesId = this.socialAndProfessional;
            break;
          case 'baseSkills':
            selectedModulesId = this.baseSkills;
            break;
          case 'parentingHelp':
            selectedModulesId = this.parentingHelp;
            break;
          case 'digitalCultureSecurity':
            selectedModulesId = this.digitalCultureSecurity;
            break;
        }
        if (selectedModulesId.length) {
          this.categoriesExpanded.push(cat.id);
        }
        cat.modules = cat.modules.filter((module) => selectedModulesId.includes(module.id));
      });
    });
  }

  public isCategorieExpanded(id: string): boolean {
    return this.categoriesExpanded.includes(id);
  }

  public toggleCollapse(id: string): void {
    if (this.isCategorieExpanded(id)) {
      const index = this.categoriesExpanded.findIndex((categorieId) => categorieId === id);
      this.categoriesExpanded.splice(index, 1);
    } else {
      this.categoriesExpanded.push(id);
    }
  }

  public isModulePicked(categorie: Category, module: Module) {
    const index = this.selectedChoices.findIndex((_categorie) => _categorie.id === categorie.id);
    if (index === -1) return false;
    return this.selectedChoices[index].modules.findIndex((_module) => _module.id === module.id) > -1;
  }

  public pickChoice(categorie: Category, module: Module): void {
    const index = this.selectedChoices.findIndex((_categorie) => _categorie.id === categorie.id);
    if (this.selectedChoices[index].modules.includes(module)) {
      remove(this.selectedChoices[index].modules, module);
    } else {
      this.selectedChoices[index].modules.push(module);
    }
    this.selectedType.emit(this.selectedChoices);
  }
}
