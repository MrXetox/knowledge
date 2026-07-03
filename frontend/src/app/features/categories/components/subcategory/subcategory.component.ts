import { Component, inject, input, signal } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

import { NgIcon } from '@ng-icons/core';

import { DialogService } from '../../../../shared/ui/dialog/services/dialog.service';
import { CategoriesService } from '../../services/categories.service';
import { CategoryColors, CategoryLeaf } from '../../models/categories.model';
import { CategoryPayload } from '../../payload/categories.payload';
import { CategoryInput } from '../input/category.input';

@Component({
  selector: 'app-subcategory',
  imports: [
    CdkDragHandle,
    NgIcon,
    CategoryInput
  ],
  templateUrl: './subcategory.component.html',
  styleUrl: './subcategory.component.css'
})
export class SubcategoryComponent {
  /**
   * Injection du service de dialogue pour afficher des boîtes de confirmation
   * @private
   */
  private readonly dialog_service = inject(DialogService);

  /**
   * Injection du service de gestion des catégories pour effectuer des opérations CRUD
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Catégorie à afficher et modifier dans le composant
   * @readonly
   */
  readonly subcategory = input.required<CategoryLeaf>();

  /**
   * Signal indiquant si le formulaire de modification est affiché
   * @protected
   */
  protected readonly is_editing = signal<boolean>(false);

  /**
   * Mapping des couleurs associées aux catégories pour l'affichage
   * @protected
   */
  protected readonly CategoryColors = CategoryColors;

  /**
   * Affiche le formulaire de modification
   * @protected
   */
  protected onEdit(): void {
    this.is_editing.set(true);
  }

  /**
   * Modifie la catégorie
   *
   * @param payload Information de la catégorie (nom, icône)
   *
   * @protected
   */
  protected onEdited(payload: CategoryPayload | undefined): void {
    this.is_editing.set(false);
    if (!payload) return;

    this.categories_service.update(this.subcategory().id, payload);
  }

  /**
   * Supprime la catégorie
   * @protected
   */
  protected onDelete(): void {
    this.dialog_service.danger({
      title: `Supprimer ${this.subcategory().name}`,
      message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?'
    }).subscribe((response) => response?.confirmed ? this.categories_service.delete(this.subcategory().id) : null);
  }

}
