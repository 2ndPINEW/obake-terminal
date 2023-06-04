import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceCreateComponent } from './workspace-create.component';

describe('WorkspaceCreateComponent', () => {
  let component: WorkspaceCreateComponent;
  let fixture: ComponentFixture<WorkspaceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
