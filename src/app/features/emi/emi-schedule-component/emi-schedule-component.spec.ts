import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmiScheduleComponent } from './emi-schedule-component';

describe('EmiScheduleComponent', () => {
  let component: EmiScheduleComponent;
  let fixture: ComponentFixture<EmiScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmiScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
