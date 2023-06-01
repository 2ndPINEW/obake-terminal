import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherAnimationComponent } from './weather-animation.component';

describe('WeatherAnimationComponent', () => {
  let component: WeatherAnimationComponent;
  let fixture: ComponentFixture<WeatherAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherAnimationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
