import { effect, inject, Service, signal } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';

import { catchError, EMPTY, firstValueFrom, Observable, tap } from 'rxjs';
import { strToU8, zipSync } from 'fflate';

import { environment } from '../../../../environments/environment';

import { CategoriesService } from '../../categories/services/categories.service';
import { Card, Fiche } from '../models/fiches.model';
import { FicheExport, FichePayload } from '../payloads/fiche.payload';
import { ToastService } from '../../../core/layout/toast/services/toast.service';

@Service()
export class FichesService {
  /**
   * Endpoint pour la gestion des fiches
   * @private
   */
  private readonly API_URL = `${environment.api_url}/fiches`;

  /**
   * Injection du service HTTP pour les requêtes API
   * @private
   */
  private readonly http = inject(HttpClient);

  /**
   * Injection du service des catégories pour refresher l'arbre des catégories après la création/modification/suppression d'une fiche
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Injection du service de toast pour afficher les messages d'erreur
   * @private
   */
  private readonly toast_service = inject(ToastService);

  /**
   * Cache locale des fiches allégées récupérées
   * @private
   */
  private readonly cache = signal<Card[]>([]);

  /**
   * Indique si la dernière requête a retourné moins de 30 fiches, ce qui signifie qu'il n'y a plus de fiches à charger
   * @private
   */
  private readonly limit = signal<boolean>(false);

  /**
   * Paramètres de recherche pour la requête des fiches
   * @private
   */
  private readonly search_params = signal<HttpParams>(new HttpParams());

  /**
   * Requête HTTP pour récupérer les fiches allégées en fonction des paramètres de recherche
   * @private
   */
  private readonly query = httpResource<Card[]>(() => {
    const params = this.search_params();
    return `${this.API_URL}?${params.toString()}`;
  }, { defaultValue: [] });

  /**
   * Signaux exposés pour les composants
   *  - cards : liste des fiches allégées récupérées
   *  - isLoading : indique si la requête est en cours
   *  - error : contient l'erreur si la requête a échoué
   */
  readonly cards = this.cache.asReadonly();
  readonly isLoading = this.query.isLoading;
  readonly error = this.query.error;

  constructor() {
    effect(() => {
      const fiches = this.query.value();
      if (fiches) {
        this.search_params().has('offset')
          ? this.cache.update(current => [ ...current, ...fiches ])
          : this.cache.set(fiches);

        this.limit.set(fiches.length != 30);
      }
    });
  }

  /**
   * Recherche les fiches avec le filtre indiquée en réinitialisant les précédents résultats
   *
   * @param params Filtres de recherche (catégorie, texte, archivées, dernière fiche)
   */
  search(params?: {
    category?: number;
    search?: string;
    archived?: boolean;
  }) {
    this.search_params.update(param => {
      param = new HttpParams();

      if (params?.category)
        param = param.set('category', params.category)

      if (params?.search)
        param = param.set('search', params.search);

      if (params?.archived)
        param = param.set('archived', params.archived);

      return param;
    });
  }

  /**
   * Charge la page suivante à partir de la dernière fiche connue
   *
   * @param offset Identifiant de la dernière fiche affichée
   */
  load(offset: number) {
    if (this.limit()) return;
    this.search_params.update(param => param.set('offset', offset));
  }

  /**
   * Récupère une fiche complète par son identifiant et met à jour le nombre de vues de sa card
   *
   * @param id Identifiant de la fiche à récupérer
   */
  get(id: number): Observable<Fiche> {
    return this.http.get<Fiche>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.cache.update(cards =>
          cards.map(card => card.id === id ? { ...card, views: card.views + 1 } : card)
        )),
        catchError(err => {
          this.toast_service.error(err.error.message || 'Erreur lors de la récupération de la fiche');
          return EMPTY;
        })
      )
  }

  /**
   * Crée une nouvelle fiche et rafraîchit l'état
   *
   * @param data Données de la fiche à créer
   */
  create(data: FichePayload): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.API_URL}/`, data)
      .pipe(
        tap(() => this.categories_service.refresh()),
        catchError(err => {
          this.toast_service.error(err.error.message || 'Erreur lors de la création de la fiche');
          return EMPTY;
        })
      );
  }

  /**
   * Met à jour une fiche existante et rafraîchit l'état
   *
   * @param id Identifiant de la fiche à modifier
   * @param data Données à mettre à jour de la fiche
   */
  update(id: number, data: Partial<FichePayload>): Observable<Fiche> {
    return this.http.patch<Fiche>(`${this.API_URL}/${id}`, data)
      .pipe(
        tap(new_fiche => this.cache.update(cards =>
          cards.map(card =>
            card.id === id
              ? {
                  id: id,
                  title: new_fiche.title,
                  categories: new_fiche.categories,
                  tags: new_fiche.tags,
                  views: new_fiche.views,
                  archived: new_fiche.archived,
                  last_modified: new_fiche.history[new_fiche.history.length - 1].date
                }
              : card
          )
        )),
        tap(() => this.categories_service.refresh()),
        catchError(err => {
          this.toast_service.error(err.error.message || 'Erreur lors de la mise à jour de la fiche');
          return EMPTY;
        })
      )
  }

  /**
   * Supprime une fiche
   *
   * @param id Identifiant de la fiche à supprimer
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.cache.update(fiches => fiches.filter(fiche => fiche.id !== id))),
        tap(() => this.categories_service.refresh()),
        catchError(err => {
          this.toast_service.error(err.error.message || 'Erreur lors de la suppression de la fiche');
          return EMPTY;
        })
      )
  }

  /**
   * Télécharge une fiche complète au format ZIP
   *
   * @param payload Données de la fiche à exporter
   */
  async download(payload: FicheExport): Promise<File> {
    // Clone le payload pour éviter de modifier l'original
    const fiche = structuredClone(payload);

    // Transforme les images des étapes en fichiers et met à jour les chemins dans le payload
    const files: Record<string, Uint8Array> = {};

    // Parcourt les étapes de la fiche et télécharge les images associées
    for (const [id, step] of fiche.steps.entries()) {
      // Si l'étape n'a pas d'image, on passe à l'étape suivante
      if (!step.image) continue;

      try {
        // Récupère l'image depuis l'URL et la transforme en Blob
        const image_blob = await firstValueFrom(this.http.get<Blob>(step.image, {responseType: 'blob' as 'json'}));

        // Récupère le nom de fichier et l'extension de l'image
        const filename = step.image.split('/').pop() || '';
        const last_index = filename.lastIndexOf('.');
        const extension = filename.substring(last_index + 1);

        // Transforme le Blob en tableau d'octets
        const image = new Uint8Array(await image_blob.arrayBuffer());

        // Met à jour le chemin de l'image dans le payload et ajoute le fichier à l'archive
        step.image = `step_${ id }.${ extension }`;
        files[`images/${ step.image }`] = image;
      } catch {
        step.image = '';
      }
    }
    // Transforme le payload en JSON et l'ajoute à l'archive
    files['fiche.json'] = strToU8(JSON.stringify(fiche));
    return new File([zipSync(files)], `${fiche.title}.zip`, { type: 'application/zip' });
  }
}
