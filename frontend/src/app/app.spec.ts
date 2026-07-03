import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { Component, input, signal } from '@angular/core';

import { environment } from '../environments/environment';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { ToastService } from './core/layout/toast/services/toast.service';
import { ToastComponent } from './core/layout/toast/toast.component';

@Component({ selector: 'app-sidebar', template: '' })
class mockSidebarComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}


@Component({ selector: 'app-toast', template: '' })
class mockToastComponent {
  id = input.required<number>();
}

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  let title: string;
  let subtitle: string;

  const toasts = signal<{ id: number }[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ToastService, useValue: { toasts: toasts } },
      ]
    })
      .overrideComponent(App, {
        remove: { imports: [SidebarComponent, ToastComponent] },
        add: { imports: [mockSidebarComponent, mockToastComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    title = environment.app_name;
    subtitle = environment.service_name;
    await fixture.whenStable();
  });

  afterEach(() => {
    environment.app_name = title;
    environment.service_name = subtitle;
  })

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render sidebar', () => {
    const sidebar = fixture.debugElement.query(By.directive(mockSidebarComponent));
    expect(sidebar).toBeTruthy();
  });

  it('should pass the title and subtitle variable', () => {
    const sidebar = fixture.debugElement.query(By.directive(mockSidebarComponent));
    const instance = sidebar.componentInstance as mockSidebarComponent;

    expect(instance.title()).toBe((component as any).title);
    expect(instance.subtitle()).toBe((component as any).subtitle);
  });

  it('should show toasts', () => {
    toasts.set([{ id: 2 }, { id: 422 }]);
    fixture.detectChanges();

    const toasts_components = fixture.debugElement.queryAll(By.directive(mockToastComponent));
    expect(toasts_components).toHaveLength(2);
    expect((toasts_components[0].componentInstance as mockToastComponent).id()).toBe(2);
  });

  it('should not show snake', () => {
    expect(fixture.debugElement.query(By.css('iframe'))).toBeNull();
  });

  it('should show when snake is active', () => {
    (component as any).snake.set(true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('iframe'))).toBeTruthy();
  });

  it('should deactivate snake when blur', async () => {
    (component as any).snake.set(true);
    fixture.detectChanges();

    const iframe = fixture.debugElement.query(By.css('iframe'));
    iframe.triggerEventHandler('blur');
    fixture.detectChanges();

    expect((component as any).snake()).toBe(false);
  });
});
