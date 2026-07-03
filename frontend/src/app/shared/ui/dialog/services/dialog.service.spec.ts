import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';

import { Observable, of } from 'rxjs';
import { DialogService } from './dialog.service';
import { DialogConfig, DialogResponse } from '../models/dialog.model';
import { DialogComponent } from '../dialog.component';

describe('DialogService', () => {
  let service: DialogService;
  let closed$: Observable<DialogResponse | undefined>;
  let mockDialog: any;

  const config = { title: 'Titre', message: 'Message' } as DialogConfig;

  beforeEach(() => {
    closed$ = of(undefined);
    mockDialog = {
      open: vi.fn().mockReturnValue({ closed: closed$ }),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Dialog, useValue: mockDialog }],
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the dialog with the given component and return the closed stream', () => {
    const result = service.open(DialogComponent, config);

    expect(mockDialog.open).toHaveBeenCalledTimes(1);
    expect(result).toBe(closed$);

    const [component] = mockDialog.open.mock.lastCall!;
    expect(component).toBe(DialogComponent);
  });

  it('should apply the default config', () => {
    service.open(DialogComponent, config);

    const [, options] = mockDialog.open.mock.lastCall!;
    expect(options).toEqual(
      expect.objectContaining({
        data: config,
        hasBackdrop: true,
        disableClose: true,
        role: 'dialog',
        ariaLabelledBy: 'dialog-title',
        ariaDescribedBy: 'dialog-desc',
      })
    );
  });

  it('should merge the layout into the options', () => {
    service.open(DialogComponent, config, { width: '480px', maxHeight: '90vh' });

    const [, options] = mockDialog.open.mock.lastCall!;
    expect(options.width).toBe('480px');
    expect(options.maxHeight).toBe('90vh');
    expect(options.disableClose).toBe(true);
  });

  it('should open with role "confirm"', () => {
    service.confirm(config);

    const [component, options] = mockDialog.open.mock.lastCall!;
    expect(component).toBe(DialogComponent);
    expect(options.data.role).toBe('confirm');
  });

  it('should return the closed stream (confirm)', () => {
    expect(service.confirm(config)).toBe(closed$);
  });

  it('should open with confirm_color "danger"', () => {
    service.danger(config);

    const [component, options] = mockDialog.open.mock.lastCall!;
    expect(component).toBe(DialogComponent);
    expect(options.data.role).toBe('danger');
  });

  it('should return the closed stream (danger)', () => {
    expect(service.danger(config)).toBe(closed$);
  });
});
