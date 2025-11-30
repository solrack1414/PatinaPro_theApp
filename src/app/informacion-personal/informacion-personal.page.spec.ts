import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionPersonalPage } from './informacion-personal.page';

describe('InformacionPersonalPage', () => {
  let component: InformacionPersonalPage;
  let fixture: ComponentFixture<InformacionPersonalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionPersonalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
