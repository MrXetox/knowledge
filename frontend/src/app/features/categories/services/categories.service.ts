import { computed, inject, Service } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';

import { catchError, EMPTY } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { CategoryBranch, CategoryNode } from '../models/categories.model';
import { CreateCategoryPayload, UpdateCategoryPayload } from '../payload/categories.payload';
import { ToastService } from '../../../core/layout/toast/services/toast.service';

@Service()
export class CategoriesService {
  /**
   * Endpoint pour la gestion des catégories
   * @private
   */
  private readonly API_URL = `${environment.api_url}/categories`;

  /**
   * Injection du service HTTP pour les requêtes API
   * @private
   */
  private readonly http = inject(HttpClient);

  /**
   * Injection du service Toast pour afficher les messages d'erreur
   * @private
   */
  private readonly toast_service = inject(ToastService);

  /**
   * Signal contenant la liste des catégories et sous-catégories récupérées depuis l'API
   * @private
   */
  private readonly query = httpResource<CategoryNode[]>(() => this.API_URL, {
    defaultValue: []
  });

  /**
   * Signaux exposés pour les composants
   *  - categories : contient la liste des catégories et sous-catégories
   *  - isLoading : indique si la requête est en cours
   *  - error : contient l'erreur si la requête a échoué
   * @readonly
   */
  readonly categories = this.query.value.asReadonly();
  readonly isLoading = this.query.isLoading;
  readonly error = this.query.error;

  /**
   * Arbre des catégories et sous-catégories pour l'affichage dans le template
   * @readonly
   */
  readonly tree = computed(() => {
    // On récupère la liste des catégories et sous-catégories depuis le signal
    const categories = this.categories();
    // Si la liste est vide, on retourne un tableau vide
    if (!categories) return [];

    // On construit l'arbre des catégories et sous-catégories à partir de la liste
    const tree: CategoryBranch[] = [];
    const map = new Map<number, CategoryBranch>();

    // On parcourt la liste pour créer les branches de l'arbre
    categories
      .forEach(category => {
        // On ne garde que les catégories racines (celles qui n'ont pas de parent)
        if (category.parent_id) return;

        // On crée une branche pour la catégorie racine et on l'ajoute à l'arbre
        const root = {...category, children: []} as CategoryBranch;
        tree.push(root)
        map.set(category.id, root);
      });

    // On parcourt la liste pour ajouter les sous-catégories aux branches de l'arbre
    categories
      .forEach(category => {
        // On ne garde que les sous-catégories (celles qui ont un parent)
        if (!category.parent_id) return;

        // On récupère la branche de l'arbre correspondant à la catégorie parente
        const root = map.get(category.parent_id);
        if (!root) return;

        // On ajoute la sous-catégorie à la branche de l'arbre
        root.children.push(category);
      });

    return tree;
  });

  /**
   * Rafraîchit la liste des catégories et sous-catégories en effectuant une nouvelle requête à l'API
   */
  refresh() {
    this.query.reload();
  }

  /**
   * Effectue une requête pour créer une nouvelle catégorie ou sous-catégorie
   * @param payload
   */
  create(payload: CreateCategoryPayload): void {
    this.http.post(this.API_URL, payload)
      .pipe(
        catchError(err => {
          this.toast_service.error(err?.error?.message || 'Erreur lors de la création de la catégorie');
          return EMPTY;
        })
      )
      .subscribe(() => this.query.reload());
  }

  /**
   * Effectue une requête pour mettre à jour une catégorie ou sous-catégorie
   *
   * @param id ID de la catégorie à modifier
   * @param payload Contient les informations à mettre à jour de la catégorie
   */
  update(id: number, payload: UpdateCategoryPayload): void {
    this.http.patch(this.API_URL + '/' + id, payload)
      .pipe(
        catchError(err => {
          this.toast_service.error(err?.error?.message || 'Erreur lors de la mise à jour de la catégorie');
          return EMPTY;
        })
      )
      .subscribe(() => this.query.reload());
  }

  /**
   * Effectue une requête pour supprimer une catégorie ou sous-catégorie
   *
   * @param id ID de la catégorie à supprimer
   */
   delete(id: number): void {
     this.http.delete(this.API_URL + '/' + id)
       .pipe(
         catchError(err => {
           this.toast_service.error(err?.error?.message || 'Erreur lors de la suppression de la catégorie');
           return EMPTY;
         })
       )
       .subscribe(() => this.query.reload());
   }
}
