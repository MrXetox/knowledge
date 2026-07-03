import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { ToastService } from './services/toast.service';
import { provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  let mockToastService = {
    get: vi.fn().mockImplementation((id: number) => { if (id === 1) return { id: 1, message: 'Test toast', type: 'info', duration: 5000 }; else return undefined; }),
    remove: vi.fn()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        provideIcons({ lucideInfo })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    vi.clearAllMocks();
  });

  it('should create', () => {
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should throw an error if the toast does not exist', async () => {
    fixture.componentRef.setInput('id', null);
    expect(() => fixture.detectChanges()).toThrow(`Toast with id null not found`);
  });

  it('should get the right style', () => {
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
    expect(component['style']()).toEqual({ colors: 'bg-primary-subtle border-primary-border text-primary-strong', icon: 'lucideInfo' });
  });

  it('should close after the specified duration', async () => {
    vi.useFakeTimers();
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
    expect(component['is_closing']()).toBe(false);
    vi.advanceTimersByTime(5001);
    expect(component['is_closing']()).toBe(true);
    vi.useRealTimers();
  });

  it('should remove the toast when closing animation ends', () => {
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
    component['is_closing'].set(true);
    component['onAnimationEnd']();
    expect(mockToastService.remove).toHaveBeenCalledWith(1);
  });

  it('should NOT remove the toast if it is not closing', () => {
    component['is_closing'].set(false);
    component['onAnimationEnd']();
    expect(mockToastService.remove).not.toHaveBeenCalled();
  });
});
