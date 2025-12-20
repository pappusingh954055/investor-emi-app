import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrofinancierComponent } from './microfinancier-component';

describe('MicrofinancierComponent', () => {
  let component: MicrofinancierComponent;
  let fixture: ComponentFixture<MicrofinancierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicrofinancierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicrofinancierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
