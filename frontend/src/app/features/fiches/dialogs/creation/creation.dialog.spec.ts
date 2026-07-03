import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationDialog } from './creation.dialog';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideDownload, lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { Component, model } from '@angular/core';
import { EditorInput } from '../../../../shared/ui/editor/editor.input';
import { JSONContent } from '@tiptap/core';

@Component({ selector: 'app-editor', template: '' })
class MockEditorInput {
  readonly value = model<JSONContent>({
    type: 'doc',
    content: [
      {
        type: 'paragraph'
      }
    ]
  });
}

describe('CreationDialog', () => {
  let component: CreationDialog;
  let fixture: ComponentFixture<CreationDialog>;

  class mockDialogRef {
    close = vi.fn();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationDialog],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: {} },
        provideIcons({ lucidePlus, lucideDownload, lucideChevronLeft, lucideChevronRight }),
      ]
    })
      .overrideComponent(CreationDialog, {
        remove: { imports: [EditorInput] },
        add: { imports: [MockEditorInput] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
