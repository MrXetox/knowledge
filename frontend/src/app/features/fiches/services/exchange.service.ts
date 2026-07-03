import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, EMPTY, firstValueFrom, Observable } from 'rxjs';
import { strFromU8, unzipSync } from 'fflate';

import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/layout/toast/services/toast.service';
import { FicheExport } from '../payloads/fiche.payload';

@Service()
export class ExchangeService {
  /**
   * Endpoint pour la gestion des fiches
   * @private
   */
  private readonly API_URL = `${environment.api_url}/upload`;

  /**
   * Injection du service HTTP pour les requêtes API
   * @private
   */
  private readonly http = inject(HttpClient);

  /**
   * Injection du service de toast pour afficher les messages d'erreur
   * @private
   */
  private readonly toast_service = inject(ToastService);

  /**
   * Upload un fichier et retourne l'URL du fichier uploadé
   *
   * @param file Fichier à uploader
   * @returns Observable contenant l'URL du fichier uploadé
   */
  upload(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(this.API_URL, formData)
      .pipe(
        catchError(err => {
          this.toast_service.error(err.error.message || 'Impossible d\'uploader le fichier');
          return EMPTY;
        })
      );
  }

  /**
   * Transforme un fichier compressé en une fiche utilisable par l'application
   *
   * @param payload Fichier compressé contenant la fiche et ses images
   * @return Fiche décompressée et prête à l'emploi
   */
  async import(payload: File): Promise<FicheExport> {
    // Transforme le fichier compressé en un tableau d'octets
    const buffer = new Uint8Array(await payload.arrayBuffer());

    // Décompresse le fichier et récupère les fichiers contenus dans l'archive
    const zip = unzipSync(buffer);

    // Récupère le fichier fiche.json et le parse en objet FicheExport
    const fiche_compressed = zip['fiche.json'];

    // Vérifie que le fichier fiche.json existe dans l'archive, sinon on lance une erreur
    if (!fiche_compressed) throw new Error('Could not load fiche');

    // Parse le fichier fiche.json en objet FicheExport
    const fiche: FicheExport = JSON.parse(strFromU8(fiche_compressed));

    // Parcourt les étapes de la fiche et upload les images associées
    for (const step of fiche.steps) {
      // Vérifie si l'étape contient une image, sinon on passe à l'étape suivante
      if (!step.image) continue;

      // Récupère l'image compressée depuis l'archive
      const image_compressed = zip[`images/${step.image}`];
      // Vérifie que l'image existe dans l'archive, sinon on lance une erreur
      if (!image_compressed) throw new Error('Could not load image');

      // Upload l'image et récupère l'URL de l'image uploadée
      const image = new File([new Uint8Array(image_compressed)], step.image);
      const result = await firstValueFrom(this.upload(image), { defaultValue: null });
      step.image = result ? result.url : '';
    }

    return fiche;
  }
}
