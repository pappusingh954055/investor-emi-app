import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayConfirmDialogComponent } from './pay-confirm-dialog-component';

describe('PayConfirmDialogComponent', () => {
  let component: PayConfirmDialogComponent;
  let fixture: ComponentFixture<PayConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
