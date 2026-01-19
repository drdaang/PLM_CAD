import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomNodeComponent } from './bom-node-component';

describe('BomNodeComponent', () => {
  let component: BomNodeComponent;
  let fixture: ComponentFixture<BomNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BomNodeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
