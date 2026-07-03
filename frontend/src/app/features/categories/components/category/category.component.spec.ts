import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryComponent } from './category.component';
import { CategoryBranch } from '../../models/categories.model';
import { CategoriesService } from '../../services/categories.service';
import { DialogService } from '../../../../shared/ui/dialog/services/dialog.service';
import { By } from '@angular/platform-browser';
import { CategoryInput } from '../input/category.input';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideChevronRight,
  lucideHome,
  lucidePencil,
  lucidePlus,
  lucideTrash2
} from '@ng-icons/lucide';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  let mockCategory: CategoryBranch = {
    id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null, children: [
      {
        id: 2, name: 'Subcategory-1', position: 0, special: 'red', parent_id: 1, fiches_count: 90
      }
    ]
  };

  let mockCategoriesService: any;
  let mockDialogService: any;

  beforeEach(async () => {
    mockCategoriesService = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    mockDialogService = {
      danger: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: DialogService, useValue: mockDialogService },
        provideIcons({ lucideChevronDown, lucideChevronRight, lucideHome, lucidePlus, lucidePencil, lucideTrash2 })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    fixture.componentRef.setInput('category', mockCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open creation on onCreate', () => {
    component['onCreate']();
    expect(component['is_creating']()).toBe(true);
    expect(component['trigger']().expanded()).toBe(true);
    fixture.detectChanges();

    const create = fixture.debugElement.query(By.directive(CategoryInput));
    expect(create).toBeTruthy();
  });

  it('should call create with parent_id on onCreated', () => {
    const payload = { name: 'New', special: 'blue' };
    component['onCreated'](payload);
    expect(mockCategoriesService.create).toHaveBeenCalledWith({ ...payload, parent_id: mockCategory.id });
  });

  it('should call update on onEdited with payload', () => {
    const payload = { name: 'Edited', special: 'green' };
    component['onEdited'](payload);
    expect(mockCategoriesService.update).toHaveBeenCalledWith(mockCategory.id, payload);
  });

  it('should call delete when dialog confirmed', () => {
    mockDialogService.danger = vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ confirmed: true }) });
    component['onDelete']();
    expect(mockCategoriesService.delete).toHaveBeenCalledWith(mockCategory.id);
  });

  it('should not call delete when dialog cancelled', () => {
    mockDialogService.danger = vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ confirmed: false }) });
    component['onDelete']();
    expect(mockCategoriesService.delete).not.toHaveBeenCalled();
  });
});
