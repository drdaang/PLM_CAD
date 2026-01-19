import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartDetailsComponent } from './part-details';

describe('PartDetails', () => {
  let component: PartDetailsComponent;
  let fixture: ComponentFixture<PartDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
