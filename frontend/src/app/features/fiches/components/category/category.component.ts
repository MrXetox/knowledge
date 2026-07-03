import { Component, computed, inject, input, signal } from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';

import { NgIcon } from '@ng-icons/core';

import { CategoriesService } from '../../../categories/services/categories.service';
import {
  CategoryBranch,
  CategoryColors,
  CategoryLeaf
} from '../../../categories/models/categories.model';

@Component({
  selector: 'app-category',
  imports: [
    NgIcon,
    I18nPluralPipe,
    CdkOverlayOrigin,
    CdkConnectedOverlay
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  /**
   * Liste des IDs des catégories à afficher
   * @readonly
   */
  readonly categories_ids = input.required<number[]>();

  /**
   * Injection des services des Catégories pour récupérer les informations des catégories
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Compteur pour générer un identifiant unique pour chaque instance du composant
   * @private
   */
  private static counter = 0;
  protected readonly uid = ++CategoryComponent.counter;

  /**
   * Signal d'état de l'affichage du dropdown
   * @private
   */
  protected readonly is_dropdown_open = signal<boolean>(false);

  /**
   * Listes des classes tailwind pour représenter les catégories
   * @private
   */
  protected readonly CategoryColors = CategoryColors;

  /**
   * Génère la liste des catégories à afficher
   * Contient la liste des catégories avec l'icône de leur parent.
   * Gère le cas des fiches archivées
   *
   * @protected
   */
  protected readonly categories = computed<{id: number, name: string, color: CategoryLeaf['special'], icon: CategoryBranch['special'] }[]>(() => {
    const ids = this.categories_ids();
    const categories = this.categories_service.categories();

    // Si aucune catégorie n'est fournie, on retourne une catégorie "Archivée"
    if (ids.length === 0) {
      return [
        {
          id: -1,
          name: 'Archivée',
          color: 'indigo',
          icon: 'lucideLightbulb'
        }
      ]
    }

    // Si des catégories sont fournies, on filtre les catégories pour ne garder que celles dont l'id est dans la liste des ids fournis.
    return categories
      .filter((category): category is CategoryLeaf => ids.includes(category.id))
      .map(category => {
        const parent = categories.find(c => c.id === category.parent_id) as CategoryBranch;
        return { id: category.id, name: category.name, color: category.special, icon: parent!.special };
      })
  });

  /**
   * Ouvre le dropdown s'il y a plus d'une catégorie à afficher
   * @protected
   */
  protected onHover(): void {
    if (this.categories().length < 2) return;
    this.is_dropdown_open.set(true);
  }

  /**
   * Ferme le dropdown
   * @protected
   */
  protected onLeave(): void {
    this.is_dropdown_open.set(false);
  }
}
