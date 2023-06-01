import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainComponent } from './pain.component';

describe('PainComponent', () => {
  let component: PainComponent;
  let fixture: ComponentFixture<PainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
