import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComponent } from './image.component';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent],
      providers: [
        provideIcons({ lucideLoader2 })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('src', 'test/image.jpg');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
