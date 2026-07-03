import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerComponent } from './viewer.component';
import { By } from '@angular/platform-browser';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy } from '@ng-icons/lucide';

describe('ViewerComponent', () => {
  let component: ViewerComponent;
  let fixture: ComponentFixture<ViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerComponent],
      providers: [provideIcons({ lucideCopy })]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', 'test');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize viewer', () => {
    const viewer = component['viewer']();
    expect(viewer).toBeDefined();
    expect(viewer.getJSON).toBeDefined();
    expect(viewer.isActive).toBeDefined();
  });

  it('should have tiptap editor directive', () => {
    const editor = fixture.debugElement.query(By.directive(TiptapEditorDirective));
    expect(editor).toBeTruthy();
  });

  it('should destroy viewer on component destroy', () => {
    const viewer = component['viewer']();
    const destroy = vi.spyOn(viewer, 'destroy');

    component.ngOnDestroy();

    expect(destroy).toHaveBeenCalled();
  });

  it('should load initial content from field', () => {
    const value = { type: 'doc', content: [{ type: 'paragraph' }] };

    fixture.componentRef.setInput('content', value);
    fixture.detectChanges();

    expect(component.content()).toEqual(value);
  });
});
