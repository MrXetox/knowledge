import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnarchiveDialog } from './unarchive.dialog';
import { DialogRef } from "@angular/cdk/dialog";
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';

describe('UnarchiveDialog', () => {
  let component: UnarchiveDialog;
  let fixture: ComponentFixture<UnarchiveDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnarchiveDialog],
      providers: [
        { provide: DialogRef, useValue: {} },
        provideIcons({ lucideChevronLeft })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnarchiveDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
