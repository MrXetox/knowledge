import { Component, inject, input, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';

import { NgIcon } from '@ng-icons/core';

import { CategoriesService } from '../../../../../categories/services/categories.service';
import { CategoryComponent } from '../../../../components/category/category.component';

@Component({
  selector: 'app-categories-input',
  imports: [
    NgIcon,
    CdkConnectedOverlay,
    CategoryComponent
  ],
  templateUrl: './categories.input.html',
  styleUrl: './categories.input.css'
})
export class CategoriesInput extends CdkOverlayOrigin implements FormValueControl<number[]> {
  /**
   * Injection du service des catégories
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Input du formulaire pour les catégories sélectionnées
   * @readonly
   */
  readonly value = model<number[]>([]);

  /**
   * Permet de savoir si l'input a été touché par l'utilisateur
   * @readonly
   */
  readonly touched = input<boolean>(false);

  /**
   * Permet de vérfier si la valeur de l'input est invalide (true si invalide)
   * @readonly
   */
  readonly invalid = input<boolean>(false);

  /**
   * Arbre des catégories issu du service
   * @protected
   */
  protected readonly tree = this.categories_service.tree;

  /**
   * Signal d'état de l'affichage du menu dropdown pour la sélection des catégories
   * @protected
   */
  protected readonly is_dropdown_open = signal<boolean>(false);

  /**
   * Signal contenant les id des catégories dont le menu a été déployé.
   * @protected
   */
  protected readonly categories_open = signal<number[]>([]);

  /**
   * Bascule l'état d'ouverture du menu dropdown pour la sélection des catégories
   * @protected
   */
  protected onDropdownClick(): void {
    this.is_dropdown_open.update(state => !state);
  }

  /**
   * Bascule l'état d'ouverture d'une catégorie dans le menu dropdown
   * @protected
   */
  protected onCategoryClick(id: number): void {
    this.categories_open.update(categories =>
      categories.includes(id)
        ? categories.filter(category => category !== id)
        : [...categories, id]
    );
  }

  /**
   * Ajoute ou retire la sous-catégorie sélectionnée au champ du formulaire
   *
   * @param id ID de la sous-catégorie.
   * @protected
   */
  protected onSubcategoryClick(id: number): void {
    this.value.update(categories =>
      categories.includes(id)
        ? categories.filter(category => category !== id)
        : [...categories, id]
    );
  }
}
