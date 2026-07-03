import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchbarComponent } from './searchbar.component';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';

describe('SearchbarComponent', () => {
  let component: SearchbarComponent;
  let fixture: ComponentFixture<SearchbarComponent>;
  let router: Router;

  beforeEach(async () => {
    const mockRouter = {
      navigate: vi.fn()
    }

    await TestBed.configureTestingModule({
      imports: [SearchbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { search: '' } } }
        },
        provideIcons({ lucideSearch })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('input should change route', () => {
    (component as any).onChange({ target: { value: 'test' } });
    expect(router.navigate).toHaveBeenCalledWith(['/fiches'], {
      queryParams: {
        search: 'test',
      },
      queryParamsHandling: "merge",
      replaceUrl: true
    });
  });
});
