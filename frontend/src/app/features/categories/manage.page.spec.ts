import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePage } from './manage.page';
import { CategoriesService } from './services/categories.service';
import { By } from '@angular/platform-browser';
import { CategoryComponent } from './components/category/category.component';
import { Component, input, signal } from '@angular/core';
import { CategoryBranch } from './models/categories.model';
import { CategoryInput } from './components/input/category.input';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucidePlus } from '@ng-icons/lucide';

@Component({ selector: 'app-category', template: '' })
class mockCategoriesComponent {
  category =  input.required<CategoryBranch>();
}

describe('ManagePage', () => {
  let component: ManagePage;
  let fixture: ComponentFixture<ManagePage>;
  let mockCategoriesService: any;

  beforeEach(async () => {
    mockCategoriesService = {
      tree: vi.fn(() => [
        { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null, children: [
            { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
          ]},
        { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null, children: [] },
      ]),
      isLoading: signal<boolean>(false),
      error: signal<string>(''),
    };

    await TestBed.configureTestingModule({
      imports: [ManagePage],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        provideIcons({ lucidePlus, lucideChevronRight }),
      ]
    })
      .overrideComponent(ManagePage, {
        remove: { imports: [CategoryComponent] },
        add: { imports: [mockCategoriesComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManagePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of categories', () => {
    const categories_service = TestBed.inject(CategoriesService);

    const categories = fixture.debugElement.queryAll(By.directive(mockCategoriesComponent));
    expect(categories.length).toBe(categories_service.tree().length);
  });


  it('should pass categories variable', () => {
    const categories = fixture.debugElement.queryAll(By.directive(mockCategoriesComponent));
    categories.forEach((category, index) => expect(category.componentInstance.category()).toStrictEqual(mockCategoriesService.tree()[index]));
  });

  it('should show CreateComponent in creation', () => {
    component['onCreate']();
    fixture.detectChanges();

    expect(component['is_creating']()).toBe(true);

    const create = fixture.debugElement.query(By.directive(CategoryInput));
    expect(create).toBeTruthy();
  })
});
