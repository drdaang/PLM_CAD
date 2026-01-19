import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBom } from './create-bom';

describe('CreateBom', () => {
  let component: CreateBom;
  let fixture: ComponentFixture<CreateBom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
