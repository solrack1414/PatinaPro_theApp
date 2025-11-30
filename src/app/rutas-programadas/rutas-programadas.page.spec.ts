import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutasProgramadasPage } from './rutas-programadas.page';

describe('RutasProgramadasPage', () => {
  let component: RutasProgramadasPage;
  let fixture: ComponentFixture<RutasProgramadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RutasProgramadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
