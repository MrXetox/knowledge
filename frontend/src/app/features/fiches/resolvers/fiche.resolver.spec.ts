import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { ficheResolver } from './fiche.resolver';
import { Fiche } from '../models/fiches.model';

describe('ficheResolver', () => {
  const executeResolver: ResolveFn<Fiche> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => ficheResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
