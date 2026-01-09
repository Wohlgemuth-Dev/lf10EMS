import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInspectorComponent } from './employee-inspector.component';

describe('EmployeeInspectorComponent', () => {
  let component: EmployeeInspectorComponent;
  let fixture: ComponentFixture<EmployeeInspectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInspectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
