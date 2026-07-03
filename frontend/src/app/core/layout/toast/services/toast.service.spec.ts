import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast', () => {
    service.show('Test message', 'success');
    expect(service.toasts()).toEqual([{ id: 0, message: 'Test message', type: 'success', duration: 5000 }]);
  });

  it('should not add a toast with an empty message', () => {
    service.show('', 'success');
    expect(service.toasts()).toEqual([]);
  });

  it('should get a toast by ID', () => {
    service.show('Test message', 'success');
    expect(service.get(0)).toEqual({ id: 0, message: 'Test message', type: 'success', duration: 5000 });
  });

  it('should remove a toast by ID', () => {
    service.show('Test message', 'success');
    service.remove(0);
    expect(service.toasts()).toEqual([]);
  });

  it('should add different toasts', () => {
    service.success('Success message');
    service.error('Error message');
    service.info('Info message');
    service.warning('Warning message');

    expect(service.toasts()).toEqual([
      { id: 0, message: 'Success message', type: 'success', duration: 5000 },
      { id: 1, message: 'Error message', type: 'error', duration: 5000 },
      { id: 2, message: 'Info message', type: 'info', duration: 5000 },
      { id: 3, message: 'Warning message', type: 'warning', duration: 5000 }
    ]);
  })
});
