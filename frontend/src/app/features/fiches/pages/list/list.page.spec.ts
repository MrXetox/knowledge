import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { FichesService } from '../../services/fiches.service';
import { Card } from '../../models/fiches.model';
import { ListPage } from './list.page';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';

describe('ListPage', () => {
  let component: ListPage;
  let fixture: ComponentFixture<ListPage>;
  let mockFichesService: any;

  beforeEach(async () => {
    mockFichesService = {
      cards: signal<Card[]>([]),
      isLoading: signal<boolean>(false),
      error: signal<string | null>(null),
      value: signal<Card[] | null>(null),
      search: vi.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [ListPage],
      providers: [
        provideRouter([]),
        { provide: FichesService, useValue: mockFichesService },
        provideIcons({ lucideSearch })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
