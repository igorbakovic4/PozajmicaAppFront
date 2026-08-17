import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetaljPage } from './detalj.page';

describe('DetaljPage', () => {
  let component: DetaljPage;
  let fixture: ComponentFixture<DetaljPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetaljPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
