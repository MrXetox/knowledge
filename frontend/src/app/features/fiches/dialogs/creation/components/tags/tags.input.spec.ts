import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsInput } from './tags.input';

describe('TagsInput', () => {
  let component: TagsInput;
  let fixture: ComponentFixture<TagsInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsInput],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
