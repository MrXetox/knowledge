import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';

import { FiledropzoneInput } from './filedropzone.input';

describe('FiledropzoneInput', () => {
  let component: FiledropzoneInput;
  let fixture: ComponentFixture<FiledropzoneInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiledropzoneInput],
      providers: [
        provideIcons({ lucideDownload })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FiledropzoneInput);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('placeholder', 'Test placeholder');
    fixture.componentRef.setInput('accept', 'image/*');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit files', () => {
    vi.spyOn(component.files, 'emit');

    const file1 = new File([''], 'image1.png', { type:'image/png' });
    const file2 = new File([''], 'image2.png', { type:'image/png' });

    const mockDropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [ file1, file2 ]
      }
    } as unknown as DragEvent;

    component['onFileDrop'](mockDropEvent);

    expect(mockDropEvent.preventDefault).toHaveBeenCalled();
    expect(mockDropEvent.stopPropagation).toHaveBeenCalled();
    expect(component.files.emit).toHaveBeenCalledWith([file1, file2]);
  });
});
