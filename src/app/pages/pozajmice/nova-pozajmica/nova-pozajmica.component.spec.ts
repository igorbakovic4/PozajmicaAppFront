import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NovaPozajmicaComponent } from './nova-pozajmica.component';

describe('NovaPozajmicaComponent', () => {
  let component: NovaPozajmicaComponent;
  let fixture: ComponentFixture<NovaPozajmicaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NovaPozajmicaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NovaPozajmicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
