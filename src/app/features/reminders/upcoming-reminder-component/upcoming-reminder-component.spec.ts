import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingReminderComponent } from './upcoming-reminder-component';

describe('UpcomingReminderComponent', () => {
  let component: UpcomingReminderComponent;
  let fixture: ComponentFixture<UpcomingReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingReminderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
