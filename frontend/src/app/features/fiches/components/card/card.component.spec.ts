import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { Card } from '../../models/fiches.model';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { CategoriesService } from '../../../categories/services/categories.service';
import { provideIcons } from '@ng-icons/core';
import { lucideLightbulb } from '@ng-icons/lucide';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let mockCategoriesService: any;
  let mockCard: Card = {
    id: 0,
    title: 'test',
    categories: [],
    last_modified: new Date(),
    tags: [],
    views: 0,
    archived: false
  }

  beforeEach(async () => {
    mockCategoriesService = {
      categories: signal<Card[]>([])
    }

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        provideRouter([]),
        { provide: CategoriesService, useValue: mockCategoriesService },
        provideIcons({ lucideLightbulb })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', mockCard);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
