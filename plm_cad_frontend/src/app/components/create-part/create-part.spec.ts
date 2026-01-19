import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePart } from './create-part';

describe('CreatePart', () => {
  let component: CreatePart;
  let fixture: ComponentFixture<CreatePart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
