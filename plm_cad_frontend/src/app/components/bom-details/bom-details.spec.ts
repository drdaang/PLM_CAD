import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomDetails } from './bom-details';

describe('BomDetails', () => {
  let component: BomDetails;
  let fixture: ComponentFixture<BomDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BomDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
