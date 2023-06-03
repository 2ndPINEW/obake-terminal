import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceManageComponent } from './workspace-manage.component';

describe('WorkspaceManageComponent', () => {
  let component: WorkspaceManageComponent;
  let fixture: ComponentFixture<WorkspaceManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
