import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let mockDialogRef = {
    close: vi.fn()
  }

  const mockDialogData = {
    title: 'Test Titre',
    message: 'Test Message',
    confirm_label: 'Confirmer',
    confirm_color: 'confirm',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockDialogData },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close', () => {
    (component['cancel']())();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmed: false });
  });

  it('should confirm', () => {
    (component['confirm']())();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmed: true });
  })
});
