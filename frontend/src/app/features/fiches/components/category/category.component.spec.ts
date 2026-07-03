import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CategoriesService } from '../../../categories/services/categories.service';
import { CategoryComponent } from './category.component';
import { Card } from '../../models/fiches.model';
import { provideIcons } from '@ng-icons/core';
import { lucideLightbulb } from '@ng-icons/lucide';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let mockCategoriesService: any

  beforeEach(async () => {
    mockCategoriesService = {
      categories: signal<Card[]>([])
    }

    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        provideIcons({ lucideLightbulb })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories_ids', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
