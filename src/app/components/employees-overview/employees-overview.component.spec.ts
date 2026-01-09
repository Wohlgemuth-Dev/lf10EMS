import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesOverviewComponent } from './employees-overview.component';

describe('EmployeesOverviewComponent', () => {
  let component: EmployeesOverviewComponent;
  let fixture: ComponentFixture<EmployeesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
