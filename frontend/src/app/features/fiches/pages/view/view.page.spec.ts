import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JSONContent } from '@tiptap/core';

import { ViewPage } from './view.page';
import { Fiche } from '../../models/fiches.model';
import { CategoryComponent } from '../../components/category/category.component';
import { ViewerComponent } from '../../../../shared/ui/viewer/viewer.component';
import { ImageComponent } from '../../../../shared/ui/image/image.component';
import { HistoryComponent } from './components/history/history.component';
import { provideIcons } from '@ng-icons/core';
import { provideRouter } from "@angular/router";
import { lucideChevronRight } from "@ng-icons/lucide";

@Component({ selector: 'app-category', template: '' })
class MockCategoryComponent {
  categories_ids = input<number[]>([]);
}

@Component({ selector: 'app-viewer', template: '' })
class MockViewerComponent {
  content = input<JSONContent>();
}

@Component({ selector: 'app-image', template: '' })
class MockImageComponent {
  src = input<string>();
  alt = input<string>();
}

@Component({ selector: 'app-history', template: '' })
class MockHistoryComponent {
  history = input<unknown>();
}

describe('ViewPage', () => {
  let component: ViewPage;
  let fixture: ComponentFixture<ViewPage>;

  const mockFiche: Fiche = {
    id: 1,
    title: 'Test Fiche',
    categories: [],
    tags: [],
    views: 0,
    problem: { type: 'doc', content: [] },
    steps: [],
    notes: { type: 'doc', content: [] },
    history: [{
      date: new Date(),
      id: 0,
      author: '',
      type: 'creation',
      summary: '',
    }],
    archived: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPage],
      providers: [
        provideIcons({ lucideChevronRight }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(ViewPage, {
        remove: {
          imports: [CategoryComponent, ViewerComponent, ImageComponent, HistoryComponent],
        },
        add: {
          imports: [MockCategoryComponent, MockViewerComponent, MockImageComponent, MockHistoryComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ViewPage);
    fixture.componentRef.setInput('id', 1);
    fixture.componentRef.setInput('initial_fiche', mockFiche);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
