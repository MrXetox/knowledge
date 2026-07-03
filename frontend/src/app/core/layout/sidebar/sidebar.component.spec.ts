import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideHome, lucideText, lucideArchive, lucideTextSearch, lucidePlus } from "@ng-icons/lucide";

import { CategoriesService } from '../../../features/categories/services/categories.service';
import { FichesService } from '../../../features/fiches/services/fiches.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockCategoriesService = {
    tree: signal([
      { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null, children: [
          { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
        ]},
      { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null, children: [] },
    ])
  };

  let mockFichesService = {
    create: vi.fn()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          { path: 'accueil', children: [] },
          { path: 'fiches', children: [
            {
              path: 'archives',
              children: []
            }
          ]},
          { path: 'manage', children: [] },
        ]),
        provideIcons({ lucideChevronDown, lucideHome, lucideText, lucideArchive, lucideTextSearch, lucidePlus }),
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: FichesService, useValue: mockFichesService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Title');

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show subtitle', () => {
    fixture.componentRef.setInput('subtitle', 'Subtitle');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Subtitle');
  });

  it('should not show subtitle', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Subtitle');
  });

  it('should display navigation options', () => {
    const hrefs = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(link => link.nativeElement.getAttribute('routerLink'));

    ['/accueil', '/fiches', '/manage'].forEach(expected =>
      expect(hrefs).toContain(expected)
    );
  });
});
