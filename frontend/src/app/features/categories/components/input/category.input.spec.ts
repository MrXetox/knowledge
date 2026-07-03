import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryInput } from './category.input';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight } from '@ng-icons/lucide';

describe('CreateComponent', () => {
  let component: CategoryInput;
  let fixture: ComponentFixture<CategoryInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryInput],
      providers: [provideIcons({ lucideChevronDown, lucideChevronRight })]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryInput);
    fixture.componentRef.setInput('variant', 'category');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit payload on submit', async () => {
    component['payload'].set({ name: 'Test', special: 'lucideHome' });
    component['finish'].emit = vi.fn();

    await component['onSubmit']();

    expect(component['finish'].emit).toHaveBeenCalledWith({ name: 'Test', special: 'lucideHome' });
  });

  it('should emit undefined on cancel', () => {
    component['finish'].emit = vi.fn();
    component['onCancel']();

    expect(component['finish'].emit).toHaveBeenCalledWith(undefined);
  });
});
