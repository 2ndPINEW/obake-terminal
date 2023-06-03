import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutSettingComponent } from './shortcut-setting.component';

describe('ShortcutSettingComponent', () => {
  let component: ShortcutSettingComponent;
  let fixture: ComponentFixture<ShortcutSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShortcutSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortcutSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
