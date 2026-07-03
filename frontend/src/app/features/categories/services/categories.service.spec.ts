import { provideHttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';

import { CategoriesService } from './categories.service';
import { CategoryNode } from '../models/categories.model';
import { CategoryPayload } from '../payload/categories.payload';
import { ToastService } from '../../../core/layout/toast/services/toast.service';

const mockToastService = {
  error: vi.fn()
}

describe('CategoriesService', () => {
  const api_url = `${environment.api_url}/categories`;
  let service: CategoriesService;
  let http: HttpTestingController;

  const mock_categories: CategoryNode[] = [
    { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null, children: [] },
    { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null, children: [] },
    { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
  ];

  const mock_tree = [
    { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null,
      children: [
        { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
      ]
    },
    { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null, children: [] },
  ];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: mockToastService }
      ]
    });
    service = TestBed.inject(CategoriesService);
    http = TestBed.inject(HttpTestingController);

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET');
    get.flush(mock_categories);

    vi.clearAllMocks();
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  })

  it('should load categories on init', async () => {
    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });

  it('should create category', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome' };
    service.create(payload);

    const post = http.expectOne(api_url);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(payload);
    post.flush(null);

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush([...mock_categories, { id: 4, ...payload }]);

    await vi.waitFor(() => expect(service.categories()).toEqual([...mock_categories, { id: 4, ...payload }]));
    await vi.waitFor(() => expect(service.tree()).toEqual([...mock_tree, { id: 4, ...payload, children: [] }]));
  });

  it('should create category failed', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome' };
    service.create(payload);

    const post = http.expectOne(api_url);
    post.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la création de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });

  it('should create subcategory', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome', parent_id: 2 };
    service.create(payload);

    const post = http.expectOne(api_url);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(payload);
    post.flush(null);

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush([...mock_categories, { id: 4, ...payload, fiches_count: 0 }]);

    await vi.waitFor(() => expect(service.categories()).toEqual([...mock_categories, { id: 4, ...payload, fiches_count: 0 }]));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree.map(
      category => category.id === 2
        ? { ...category, children: [{ id: 4, ...payload, fiches_count: 0 }] }
        : category
    )));
  });

  it('should create subcategory failed', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome', parent_id: 2 };
    service.create(payload);

    const post = http.expectOne(api_url);
    post.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la création de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });

  it('should update category', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome' };
    service.update(1, payload);

    const patch = http.expectOne(api_url + '/1');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual(payload);
    patch.flush(null);

    const new_categories = mock_categories.map(
      category => category.id === 1 ? { ...category, ...payload } : category
    );

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush(new_categories);

    await vi.waitFor(() => expect(service.categories()).toEqual(new_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree.map(
      category => category.id === 1 ? { ...category, ...payload } : category
    )));
  });

  it('should update category failed', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome' };
    service.update(1, payload);

    const patch = http.expectOne(api_url + '/1');
    patch.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la mise à jour de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });

  it('should update subcategory', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome', parent_id: 2 };
    service.update(3, payload);

    const patch = http.expectOne(api_url + '/3');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual(payload);
    patch.flush(null);

    const new_categories = mock_categories.map(
      category => category.id === 3 ? { ...category, ...payload } : category
    );

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush(new_categories);

    await vi.waitFor(() => expect(service.categories()).toEqual(new_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree.map(
      category => category.id === 1
        ? { ...category, children: [] }
        : category.id === 2 ? { ...category, children: [ new_categories[2] ] } : category
    )));
  });

  it('should update subcategory failed', async () => {
    const payload: CategoryPayload = { name: 'test', special: 'lucideHome', parent_id: 2 };
    service.update(3, payload);

    const patch = http.expectOne(api_url + '/3');
    patch.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la mise à jour de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });


  it('should delete category', async () => {
    service.delete(2);

    const del = http.expectOne(api_url + '/2');
    expect(del.request.method).toBe('DELETE');
    del.flush(null);

    const new_categories = [
      { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null },
      { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
    ];

    const new_tree = [
      { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null,
        children: [
          { id: 3, name: 'Subcategory-1', position: 0, special: 'lucideHome', parent_id: 1, fiches_count: 4 },
        ]
      },
    ]

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush(new_categories);

    await vi.waitFor(() => expect(service.categories()).toEqual(new_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(new_tree));
  });

  it('should delete category failed', async () => {
    service.delete(1);

    const del = http.expectOne(api_url + '/1');
    del.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la suppression de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });

  it('should delete subcategory', async () => {
    service.delete(3);

    const del = http.expectOne(api_url + '/3');
    expect(del.request.method).toBe('DELETE');
    del.flush(null);

    const new_categories = [
      { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null },
      { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null },
    ];

    const new_tree = [
      { id: 1, name: 'Category-1', position: 0, special: 'lucideHome', parent_id: null, children: [] },
      { id: 2, name: 'Category-2', position: 0, special: 'lucideHome', parent_id: null, children: [] },
    ]

    const get = await vi.waitFor(() => http.expectOne(api_url));
    expect(get.request.method).toBe('GET')
    get.flush(new_categories);

    await vi.waitFor(() => expect(service.categories()).toEqual(new_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(new_tree));
  });

  it('should delete subcategory failed', async () => {
    service.delete(3);

    const del = http.expectOne(api_url + '/3');
    del.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    http.expectNone(api_url);
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la suppression de la catégorie'));

    await vi.waitFor(() => expect(service.categories()).toEqual(mock_categories));
    await vi.waitFor(() => expect(service.tree()).toEqual(mock_tree));
  });
});
