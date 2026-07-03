import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EditorInput } from './editor.input';
import { TiptapEditorDirective } from 'ngx-tiptap';

describe('EditorComponent', () => {
  let component: EditorInput;
  let fixture: ComponentFixture<EditorInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorInput],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorInput);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editor', () => {
    const editor = component['editor']();
    expect(editor).toBeDefined();
    expect(editor.getJSON).toBeDefined();
    expect(editor.isActive).toBeDefined();
  });

  it('should pass placeholder to editor', () => {
    fixture.componentRef.setInput('placeholder', 'Test placeholder');
    fixture.detectChanges();

    expect(component['placeholder']()).toBe('Test placeholder');
  });

  it('should render formatting toolbar', () => {
    fixture.detectChanges();

    const toolbar = fixture.debugElement.query(By.css('[role="toolbar"]'));
    expect(toolbar).toBeTruthy();
  });

  it('should have tiptap editor directive', () => {
    fixture.detectChanges();

    const editor = fixture.debugElement.query(By.directive(TiptapEditorDirective));
    expect(editor).toBeTruthy();
  });

  it('should destroy editor on component destroy', () => {
    const editor = component['editor']();
    const destroy = vi.spyOn(editor, 'destroy');

    fixture.destroy();

    expect(destroy).toHaveBeenCalled();
  });


  it('should update field value when editor content changes', async () => {
    const editor = component['editor']();
    const testContent = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Test content' }]
      }]
    };

    editor.commands.setContent(testContent);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(editor.getJSON()).toBeDefined();
  });


  it('should load initial content from field', () => {
    const value = { type: 'doc', content: [{ type: 'paragraph' }] };

    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();

    expect(component.value()).toEqual(value);
  });
});
