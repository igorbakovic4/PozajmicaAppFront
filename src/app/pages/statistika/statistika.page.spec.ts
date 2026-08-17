import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatistikaPage } from './statistika.page';

describe('StatistikaPage', () => {
  let component: StatistikaPage;
  let fixture: ComponentFixture<StatistikaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatistikaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
