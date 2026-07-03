import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepInput } from './step.input';
import { provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';

describe('StepInput', () => {
  let component: StepInput;
  let fixture: ComponentFixture<StepInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepInput],
      providers: [
        provideIcons({ lucideDownload })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
