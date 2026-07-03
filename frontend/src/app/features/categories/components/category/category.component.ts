import { Component, inject, input, signal, viewChild } from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';

import { NgIcon } from '@ng-icons/core';

import { DialogService } from '../../../../shared/ui/dialog/services/dialog.service';
import { CategoriesService } from '../../services/categories.service';
import { CategoryBranch, CategoryLeaf } from '../../models/categories.model';
import { CategoryPayload } from '../../payload/categories.payload';
import { SubcategoryComponent } from '../subcategory/subcategory.component';
import { CategoryInput } from '../input/category.input';

@Component({
  selector: 'app-category',
  imports: [
    NgIcon,
    I18nPluralPipe,
    CdkDragHandle,
    CdkDropList,
    CdkDrag,
    SubcategoryComponent,
    CategoryInput,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    AccordionGroup
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
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
  readonly category = input.required<CategoryBranch>();

  /**
   * Référence au trigger de l'accordéon pour contrôler son état (ouvert/fermé)
   * @protected
   */
  protected readonly trigger = viewChild.required('trigger', { read: AccordionTrigger });

  /**
   * Signal indiquant si le formulaire de création est affiché
   * @protected
   */
  protected readonly is_creating = signal<boolean>(false);

  /**
   * Signal indiquant si le formulaire de modification est affiché
   * @protected
   */
  protected readonly is_editing = signal<boolean>(false);

  /**
   * Affiche le formulaire de création
   * @protected
   */
  protected onCreate(): void {
    this.trigger().expand();
    this.is_creating.set(true);
  }

  /**
   * Créer une sous-catégorie
   *
   * @param payload Informations de la sous-catégorie (nom, couleur)
   *
   * @protected
   */
  protected onCreated(payload: CategoryPayload | undefined): void {
    this.is_creating.set(false);
    if (!payload) return;

    this.categories_service.create({...payload, parent_id: this.category().id });
  }

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

    this.categories_service.update(this.category().id, payload);
  }

  /**
   * Supprime la catégorie
   * @protected
   */
  protected onDelete(): void {
    this.dialog_service.danger({
      title: `Supprimer ${this.category().name}`,
      message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?'
    }).subscribe((response) => response?.confirmed ? this.categories_service.delete(this.category().id) : null);
  }

  /**
   * Déplace une sous-catégorie dans un parent ou entre-parent.
   * @protected
   */
  protected onSubcategoryDrop(event: CdkDragDrop<CategoryLeaf>): void {
    this.categories_service.update(event.item.data.id, { parent_id: this.category().id, position: event.currentIndex });
  }
}
