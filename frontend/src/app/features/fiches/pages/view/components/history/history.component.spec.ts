import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryComponent } from './history.component';
import { FicheHistory } from '../../../../models/fiches.model';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let mockHistory: FicheHistory = {
    id: 0,
    author: '',
    type: 'creation',
    date: new Date(),
    summary: ''
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('history', mockHistory);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
