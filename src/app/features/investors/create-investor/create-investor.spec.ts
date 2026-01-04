import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInvestor } from './create-investor';

describe('CreateInvestor', () => {
  let component: CreateInvestor;
  let fixture: ComponentFixture<CreateInvestor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInvestor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInvestor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
