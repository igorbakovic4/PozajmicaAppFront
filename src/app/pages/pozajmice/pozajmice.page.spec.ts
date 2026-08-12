import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PozajmicePage } from './pozajmice.page';

describe('PozajmicePage', () => {
  let component: PozajmicePage;
  let fixture: ComponentFixture<PozajmicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PozajmicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
