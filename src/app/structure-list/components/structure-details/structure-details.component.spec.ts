import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Structure } from '../../../models/structure.model';
import { AccessModality } from '../../enum/access-modality.enum';
import { Category } from '../../models/category.model';
import { Module } from '../../models/module.model';
import { StructureDetailsComponent } from './structure-details.component';

describe('StructureDetailsComponent', () => {
  let component: StructureDetailsComponent;
  let fixture: ComponentFixture<StructureDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureDetailsComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureDetailsComponent);
    component = fixture.componentInstance;
    let structure: Structure = new Structure();
    structure.baseSkills = ['123', '234', '817'];
    component.structure = structure;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close action', () => {
    spyOn(component.closeDetails, 'emit');
    component.close();
    expect(component.closeDetails.emit).toHaveBeenCalled();
    expect(component.closeDetails.emit).toHaveBeenCalledWith(true);
  });

  it('should return icon name with a string input', () => {
    const iconNameGroup = component.getAccessIcon(AccessModality.free);
    const iconNameCalendar = component.getAccessIcon(AccessModality.meeting);
    const iconNameTel = component.getAccessIcon(AccessModality.numeric);
    expect(iconNameGroup).toEqual('group');
    expect(iconNameCalendar).toEqual('calendar');
    expect(iconNameTel).toEqual('tel');
  });

  it('should update array with right modules', () => {
    let baseSkillssReferentiel = new Category();
    let accessRightsReferentiel = new Category();
    const mo1 = new Module('132', 'Uniquement sur RDV');
    const mo2 = new Module('145', 'Acc??s libre');
    const mo3 = new Module('112', 'T??l??phone / Visio');
    const arrayModule: Module[] = [mo1, mo2, mo3];
    const m1 = new Module('260', 'm1');
    const m2 = new Module('259', 'm2');
    const m3 = new Module('261', 'm3');
    const m4 = new Module('249', 'm4');
    const m5 = new Module('222', 'm5');
    const arrayModuleBase: Module[] = [m1, m2, m3, m4, m5];
    baseSkillssReferentiel.name = 'categ2';
    baseSkillssReferentiel.modules = arrayModuleBase;
    component.baseSkillssReferentiel = baseSkillssReferentiel;
    accessRightsReferentiel.name = 'categ1';
    accessRightsReferentiel.modules = arrayModule;
    component.accessRightsReferentiel = accessRightsReferentiel;
    component.structure.baseSkills = ['260', '261'];
    component.structure.accessRight = ['145', '112'];
    component.setServiceCategories();
    expect(component.baseSkills).toEqual([m1, m3]);
    expect(component.accessRights).toEqual([mo2, mo3]);
  });
});
