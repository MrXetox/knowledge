import { Component, inject, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { AccordionGroup } from '@angular/aria/accordion';

import { NgIcon } from '@ng-icons/core';

import { CategoriesService } from './services/categories.service';
import { CategoryBranch } from './models/categories.model';
import { CategoryPayload } from './payload/categories.payload';
import { CategoryComponent } from './components/category/category.component';
import { CategoryInput } from './components/input/category.input';

@Component({
  selector: 'app-manage.page',
  imports: [ CategoryComponent, CdkDropListGroup, CdkDropList, CdkDrag, CategoryInput, NgIcon, AccordionGroup ],
  templateUrl: './manage.page.html',
  styleUrl: './manage.page.css',
})
export class ManagePage {
  /**
   * Injection du service CategoriesService pour gérer les catégories
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Arbre des catégories pour l'affichage dans le template
   * @protected
   */
  protected readonly tree = this.categories_service.tree;

  /**
   * Signal indiquant si les catégories sont en cours de chargement
   * @protected
   */
  protected readonly isLoading = this.categories_service.isLoading;
  protected readonly error = this.categories_service.error;

  /**
   * Signal indiquant si le formulaire de création de catégorie est affiché
   * @protected
   */
  protected readonly is_creating = signal<boolean>(false);

  /**
   * Affiche le formulaire de création
   * @protected
   */
  protected onCreate(): void {
    this.is_creating.set(true);
  }

  /**
   * Crée une catégorie
   *
   * @param payload contient les informations de la catégorie à créer (nom, spécial)
   * @protected
   */
  protected onCategoryCreate(payload: CategoryPayload | undefined): void {
    this.is_creating.set(false);
    if (!payload) return;

    this.categories_service.create(payload);
  }

  /**
   * Déplace une catégorie dans la branche principale
   *
   * @param event Événement de CdkDragDrop indiquant la nature du déplacement
   * @protected
   */
  protected onCategoryMove(event: CdkDragDrop<CategoryBranch>): void {
    this.categories_service.update(event.item.data.id, { position: event.currentIndex })
  }

}
