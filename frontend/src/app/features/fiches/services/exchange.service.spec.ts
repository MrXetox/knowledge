import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { zipSync, strToU8 } from 'fflate';

import { environment } from '../../../../environments/environment';
import { ExchangeService } from './exchange.service';
import { ToastService } from '../../../core/layout/toast/services/toast.service';

const mockToastService = {
  error: vi.fn()
}

describe('ExchangeService', () => {
  const api_url = `${environment.api_url}/upload`;

  let service: ExchangeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: mockToastService },
      ]
    });
    service = TestBed.inject(ExchangeService);
    http = TestBed.inject(HttpTestingController);

    vi.clearAllMocks();
  });

  afterEach(() => {
    http.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload a file', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    service.upload(file)
      .subscribe();

    const post = http.expectOne(api_url);
    expect(post.request.method).toBe('POST');
    post.flush({ url: 'http://example.com/test.png' });
  });

  it('should upload a file failed', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    service.upload(file)
      .subscribe();

    const post = http.expectOne(api_url);
    post.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Impossible d\'uploader le fichier'));
  });

  it('should import a fiche', async () => {
    const mockExport = {
      title: 'test',
      tags: ['test', 'test2'],
      notes: {},
      problem: {},
      steps: [
        {
          text: "",
          image: 'step_0.png'
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
    };

    const zipped = zipSync({
      'fiche.json': strToU8(JSON.stringify(mockExport)),
      'images/step_0.png': new Uint8Array([1, 2, 3]),
      'images/step_2.jpg': new Uint8Array([3, 2, 1]),
    });
    const file = new File([zipped], 'fiche.zip', { type: 'application/zip' });

    const promise = service.import(file);

    const post = await vi.waitFor(() => http.expectOne(api_url));
    expect(post.request.method).toBe('POST');
    const body = post.request.body as FormData;
    expect((body.get('file') as File).name).toBe('step_0.png');
    post.flush({ url: 'http://example.com/uploaded_0.png' });

    const post_2 = await vi.waitFor(() => http.expectOne(api_url));
    expect(((post_2.request.body as FormData).get('file') as File).name).toBe('step_2.jpg');
    post_2.flush({ url: 'http://example.com/uploaded_2.jpg' });

    const result = await promise;

    expect(result).toEqual({
      ...mockExport,
      steps: [
        { text: '', image: 'http://example.com/uploaded_0.png' },
        { text: '', image: '' },
        { text: '', image: 'http://example.com/uploaded_2.jpg' },
        { text: '', image: '' },
      ],
    });
  });

  it('should throw when fiche.json is missing', async () => {
    const zipped = zipSync({ 'other.json': strToU8('{}') });
    const file = new File([zipped], 'fiche.zip');

    await expect(service.import(file)).rejects.toThrow('Could not load fiche');
  });

  it('should throw when image is missing', async () => {
    const mockExport = {
      title: 'test',
      tags: ['test', 'test2'],
      notes: {},
      problem: {},
      steps: [
        {
          text: "",
          image: 'step_0.png'
        },
      ]
    };

    const zipped = zipSync({
      'fiche.json': strToU8(JSON.stringify(mockExport)),
    });
    const file = new File([zipped], 'fiche.zip', { type: 'application/zip' });

    await expect(service.import(file)).rejects.toThrow('Could not load image');
  });

  it('should throw when image upload failed', async () => {
    const mockExport = {
      title: 'test',
      tags: ['test', 'test2'],
      notes: {},
      problem: {},
      steps: [
        {
          text: "",
          image: 'step_0.png'
        },
      ]
    };

    const zipped = zipSync({
      'fiche.json': strToU8(JSON.stringify(mockExport)),
      'images/step_0.png': new Uint8Array([1, 2, 3]),
    });
    const file = new File([zipped], 'fiche.zip', { type: 'application/zip' });

    const promise = service.import(file);

    const post = await vi.waitFor(() => http.expectOne(api_url));
    post.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

    const fiche = await promise;

    expect(fiche.steps[0].image).toBe('');
    await vi.waitFor(() => expect(mockToastService.error).toHaveBeenCalledWith('Impossible d\'uploader le fichier'));
  });
});
