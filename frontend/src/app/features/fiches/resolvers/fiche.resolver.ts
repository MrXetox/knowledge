import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { FichesService } from '../services/fiches.service';
import { Fiche } from '../models/fiches.model';

/**
 * Résolveur pour récupérer une fiche avant de charger la page de visualisation
 * @param route Route actuelle
 *
 * @returns ResolveFn<Fiche>
 */
export const ficheResolver: ResolveFn<Fiche> = (route) => {
  const service = inject(FichesService);
  const id = Number(route.paramMap.get('id'));

  if (!id) throw new Error('ID manquant dans la route');

  return service.get(id);
};
