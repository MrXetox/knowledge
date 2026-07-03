import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { strFromU8, unzipSync } from 'fflate';

import { environment } from '../../../../environments/environment';
import { FichesService } from './fiches.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { ToastService } from '../../../core/layout/toast/services/toast.service';
import { Card, Fiche } from '../models/fiches.model';

const mockCategoriesService = {
  refresh: vi.fn()
}

const mockToastService = {
  error: vi.fn()
}

describe('FichesService', () => {
  const api_url = `${environment.api_url}/fiches`;

  let service: FichesService;
  let http: HttpTestingController;

  const mockCard: Card = {
    id: 42,
    title: 'test',
    categories: [3, 4],
    tags: ['test', 'test2'],
    views: 4,
    last_modified: new Date(),
    archived: false,
  }

  const mockFiche: Fiche = {
    id: 42,
    title: 'test',
    categories: [3, 4],
    tags: ['test', 'test2'],
    views: 4,
    history: [
      {
        date: new Date(),
        id: 0,
        author: "",
        type: "creation",
        summary: ""
      },
    ],
    archived: false,
    notes: {},
    problem: {},
    steps: [
      {
        text: "",
        image: 'test/test'
      }
    ]
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });
    service = TestBed.inject(FichesService);
    http = TestBed.inject(HttpTestingController);

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?`));
    expect(query.request.method).toBe('GET');
    query.flush([mockCard]);
    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));

    (service as any).limit.set(false);
    vi.clearAllMocks();
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  it('should search', async () => {
    service.search({ category: 1, search: 'test', archived: true });

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?category=1&search=test&archived=true`));
    expect(query.request.method).toBe('GET');
    query.flush([mockCard]);

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
  });

  it('should search with category', async () => {
    service.search({ category: 2 });

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?category=2`));
    expect(query.request.method).toBe('GET');
    query.flush([mockCard]);

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
  });

  it('should search with search', async () => {
    service.search({ search: 'test' });

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?search=test`));
    expect(query.request.method).toBe('GET');
    query.flush([mockCard]);

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
  });

  it('should search with archived', async () => {
    service.search({ archived: true });

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?archived=true`));
    expect(query.request.method).toBe('GET');
    query.flush([mockCard]);

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
  });

  it('should load more', async () => {
    service.load(4);

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?offset=4`));
    expect(query.request.method).toBe('GET');
    query.flush([]);

    await vi.waitFor(() => expect((service as any).limit()).toBe(true));
  });

  it('should load more with params', async () => {
    service.search({ search: 'test' });

    const search = await vi.waitFor(() => http.expectOne(`${api_url}?search=test`));
    expect(search.request.method).toBe('GET');
    search.flush([mockCard]);
    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));

    (service as any).limit.set(false);
    service.load(1);

    const response = Array.from({ length: 30 }, () => ({...mockCard}));

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?search=test&offset=1`));
    expect(query.request.method).toBe('GET');
    query.flush(response);

    await vi.waitFor(() => expect((service as any).limit()).toBe(false));
    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard, ...response]));
  });

  it('should not load more when limit reached', async () => {
    (service as any).limit.set(true);
    service.load(4);
    http.expectNone(`${api_url}?offset=4`); // aucun appel
  });

  it('should load then search', async () => {
    service.load(4);

    const query = await vi.waitFor(() => http.expectOne(`${api_url}?offset=4`));
    expect(query.request.method).toBe('GET');
    query.flush([]);

    service.search({ search: 'test' });

    const search = await vi.waitFor(() => http.expectOne(`${api_url}?search=test`));
    expect(search.request.method).toBe('GET');
    search.flush([mockCard]);

    await vi.waitFor(() => expect((service as any).limit()).toBe(true));
    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
  });

  it('should get', async () => {
    service.get(42)
      .subscribe();

    const get = http.expectOne(`${api_url}/42`);
    expect(get.request.method).toBe('GET');
    get.flush(mockFiche);

    await vi.waitFor(() => expect(service.cards()).toEqual([{ ...mockCard, views: mockCard.views + 1 }]));
  });

  it('should get failed', async () => {
    service.get(42)
      .subscribe();

    const get = http.expectOne(`${api_url}/42`);
    get.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la récupération de la fiche'));
  });

  it('should create', async () => {
    service.create({
      title: 'test',
      categories: [3, 4],
      tags: ['test', 'test2'],
      archived: false,
      notes: {},
      problem: {},
      steps: []
    }).subscribe();

    const post = http.expectOne(`${api_url}/`);
    expect(post.request.method).toBe('POST');
    post.flush(mockFiche);

    await vi.waitFor(() => expect(mockCategoriesService.refresh).toHaveBeenCalled());
  });

  it('should create failed', async () => {
    service.create({
      title: 'test',
      categories: [3, 4],
      tags: ['test', 'test2'],
      archived: false,
      notes: {},
      problem: {},
      steps: []
    }).subscribe();

    const post = http.expectOne(`${api_url}/`);
    post.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
    await vi.waitFor(() => expect(mockCategoriesService.refresh).not.toHaveBeenCalled());
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la création de la fiche'));
  });

  it('should update', async () => {
    service.update(42, {
      title: 'test',
      categories: [3, 4],
      tags: ['test', 'test2'],
      archived: false,
      notes: {},
      problem: {},
      steps: []
    })
      .subscribe();

    const last_modified = new Date('2023-12-04T00:23:00Z');

    const patch = http.expectOne(`${api_url}/42`);
    expect(patch.request.method).toBe('PATCH');
    patch.flush({...mockFiche, history: [{ date: last_modified } ]});

    await vi.waitFor(() => expect(service.cards()).toEqual([{ ...mockCard, last_modified: last_modified }]));
    await vi.waitFor(() => expect(mockCategoriesService.refresh).toHaveBeenCalled());
  });

  it('should update failed', async () => {
    service.update(42, {
      title: 'test',
      categories: [3, 4],
      tags: ['test', 'test2'],
      archived: false,
      notes: {},
      problem: {},
      steps: []
    })
      .subscribe();

    const patch = http.expectOne(`${api_url}/42`);
    patch.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
    await vi.waitFor(() => expect(mockCategoriesService.refresh).not.toHaveBeenCalled());
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la mise à jour de la fiche'));
  });

  it('should delete', async () => {
    service.delete(42)
      .subscribe();

    const del = http.expectOne(`${api_url}/42`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);

    await vi.waitFor(() => expect(service.cards()).toEqual([]));
    await vi.waitFor(() => expect(mockCategoriesService.refresh).toHaveBeenCalled());
  });

  it('should delete failed', async () => {
    service.delete(42)
      .subscribe();

    const del = http.expectOne(`${api_url}/42`);
    del.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    await vi.waitFor(() => expect(service.cards()).toEqual([mockCard]));
    await vi.waitFor(() => expect(mockCategoriesService.refresh).not.toHaveBeenCalled());
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Erreur lors de la suppression de la fiche'));
  });

  it('should download', async () => {
    const mockExport = {
      title: 'test',
      tags: ['test', 'test2'],
      notes: {},
      problem: {},
      steps: [
        {
          text: "",
          image: 'test/test.png'
        },
        {
          text: "",
          image: ''
        },
        {
          text: "",
          image: 'test/test2.jpg'
        },
        {
          text: "",
          image: 'test/notfound.jpg'
        },
      ]
    };

    const promise = service.download(mockExport);

    const get = http.expectOne(`test/test.png`);
    expect(get.request.method).toBe('GET');
    expect(get.request.responseType).toBe('blob');
    get.flush(new Blob([new Uint8Array([1, 2, 3])]));

    const get_2 = await vi.waitFor(() => http.expectOne(`test/test2.jpg`));
    expect(get_2.request.method).toBe('GET');
    expect(get_2.request.responseType).toBe('blob');
    get_2.flush(new Blob([new Uint8Array([3, 2, 1])]));

    const get_3 = await vi.waitFor(() => http.expectOne(`test/notfound.jpg`));
    expect(get_3.request.method).toBe('GET');
    get_3.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    const file = await promise;

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('test.zip');
    expect(file.type).toBe('application/zip');

    const buffer = new Uint8Array(await file.arrayBuffer());
    const zip = unzipSync(buffer);

    expect(Object.keys(zip)).toContain('fiche.json');
    expect(Object.keys(zip)).toContain('images/step_0.png');
    expect(Object.keys(zip)).toContain('images/step_2.jpg');

    const fiche = JSON.parse(strFromU8(zip['fiche.json']));
    expect(fiche).toEqual({
      ...mockExport,
      steps: [
        {
          text: "",
          image: "step_0.png"
        },
        {
          text: "",
          image: ''
        },
        {
          text: "",
          image: 'step_2.jpg'
        },
        {
          text: "",
          image: ''
        },
      ]
    });

    expect(Array.from(zip['images/step_0.png'])).toEqual([1, 2, 3]);
    expect(Array.from(zip['images/step_2.jpg'])).toEqual([3, 2, 1]);
  });
});
