import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPage } from './dashboard.page';
import { signal } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { By } from '@angular/platform-browser';
import { CategoriesService } from '../categories/services/categories.service';
import { provideRouter, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from "@ng-icons/lucide";

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  let mockDashboardService: any;
  let mockCategoriesService: any;

  beforeEach(async () => {
    mockDashboardService = {
      isLoading: signal(false),
      error: signal(null),
      stats: signal(null),
    };

    mockCategoriesService = {
      tree: signal([]),
      categories: signal([])
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        provideIcons({ lucideLoader2 })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loader when stats is loading', () => {
    mockDashboardService.isLoading.set(true);
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('[role="status"]'));
    const main = fixture.debugElement.query(By.css('main'));

    expect(loader).toBeTruthy();
    expect(main).toBeFalsy();
  });

  it('should display error when stats encounters error', () => {
    mockDashboardService.error.set("Test");
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('[role="alert"]'));
    const main = fixture.debugElement.query(By.css('main'));

    expect(error).toBeTruthy();
    expect(main).toBeFalsy();
  });

  it('should display stats category', () => {
    mockCategoriesService.tree.set([
      { id: 410, name: 'Informatique', children: [{ id: 11 }] },
      { id: 412, name: 'Microsoft', children: [{ id: 44 }] },
    ]);
    const categories_id = [410, 412];
    fixture.detectChanges();

    const links_elements = fixture.debugElement.queryAll(By.directive(RouterLink));
    const links = links_elements.map(link => link.injector.get(RouterLink));
    const categories_links = links.filter(link => link.queryParams && link.queryParams['category']);

    categories_links.forEach(((link, index) => expect(link.queryParams!['category']).toBe(categories_id[index])));
  });
});
