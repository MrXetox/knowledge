import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryComponent } from './subcategory.component';
import { CategoryLeaf } from '../../models/categories.model';
import { DialogService } from '../../../../shared/ui/dialog/services/dialog.service';
import { CategoriesService } from '../../services/categories.service';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from "@ng-icons/lucide";

describe('SubcategoryComponent', () => {
  let component: SubcategoryComponent;
  let fixture: ComponentFixture<SubcategoryComponent>;

  let mockSubcategory: CategoryLeaf = {
    id: 1, name: 'Subcategory-1', position: 0, special: 'red', parent_id: 1, fiches_count: 90
  };

  let mockDialogService: any;
  let mockCategoriesService: any;

  beforeEach(async () => {
    mockDialogService = {
      danger: vi.fn()
    };

    mockCategoriesService = {
      update: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SubcategoryComponent],
      providers: [
        { provide: DialogService, useValue: mockDialogService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        provideIcons({ lucidePencil, lucideTrash2 })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoryComponent);
    fixture.componentRef.setInput('subcategory', mockSubcategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set editing when onEdit called', () => {
    (component as any).onEdit();
    expect((component as any).is_editing()).toBe(true);
  });

  it('should call update on onEdited with payload', () => {
    const payload = { name: 'Edited', special: 'blue' };
    (component as any).onEdited(payload);
    expect(mockCategoriesService.update).toHaveBeenCalledWith(mockSubcategory.id, payload);
  });

  it('should call delete when dialog confirmed', () => {
    mockDialogService.danger = vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ confirmed: true }) });
    (component as any).onDelete();
    expect(mockCategoriesService.delete).toHaveBeenCalledWith(mockSubcategory.id);
  });

  it('should not call delete when dialog cancelled', () => {
    mockDialogService.danger = vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ confirmed: false }) });
    (component as any).onDelete();
    expect(mockCategoriesService.delete).not.toHaveBeenCalled();
  });
});
