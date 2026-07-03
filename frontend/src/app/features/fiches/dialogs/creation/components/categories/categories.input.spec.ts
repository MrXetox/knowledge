import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesInput } from './categories.input';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';

describe('CategoriesInput', () => {
  let component: CategoriesInput;
  let fixture: ComponentFixture<CategoriesInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesInput],
      providers: [
        provideIcons({ lucideChevronLeft })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
