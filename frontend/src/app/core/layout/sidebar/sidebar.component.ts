import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';

import { filter, switchMap } from 'rxjs';

import { NgIcon } from '@ng-icons/core';

import { CategoriesService } from '../../../features/categories/services/categories.service';
import { DialogService } from '../../../shared/ui/dialog/services/dialog.service';
import { FichesService } from '../../../features/fiches/services/fiches.service';
import { DialogResponse } from '../../../shared/ui/dialog/models/dialog.model';
import { CategoryColors } from '../../../features/categories/models/categories.model';
import { FichePayload } from '../../../features/fiches/payloads/fiche.payload';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    NgIcon,
    RouterLinkActive,
    Tree,
    TreeItem,
    TreeItemGroup
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  /**
   * Titre de la sidebar
   * @readonly
   */
  readonly title = input.required<string>();

  /**
   * Sous-titre de la sidebar
   * @readonly
   */
  readonly subtitle = input<string>('Support RU');

  /**
   * Injection de CategoriesService pour accéder à l'arbre des catégories
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Injection de FichesService pour créer des fiches
   * @private
   */
  private readonly fiches_service = inject(FichesService);

  /**
   * Injection de DialogService pour ouvrir le dialog de création de fiche
   * @private
   */
  private readonly dialog_service = inject(DialogService);

  /**
   * Injection de Router pour naviguer vers la fiche créée
   * @private
   */
  private readonly router = inject(Router);

  /**
   * Arbre des catégories exposé par le service
   * @protected
   */
  protected readonly nodes = this.categories_service.tree;

  /**
   * Signal indiquant si le dialog de création de fiche est ouvert
   * @protected
   */
  protected readonly is_fiche_dialog = signal<boolean>(false);

  /**
   * Constructeur du composant SidebarComponent chargeant dynamiquement le module du dialog de création de fiche pour réduire la taille initiale du bundle.
   */
  constructor() {
    import('../../../features/fiches/dialogs/creation/creation.dialog');
  }

  /**
   * Ouvre le dialog de création de fiche et navigue vers la fiche créée si l'utilisateur confirme la création.
   * @protected
   */
  protected async onFicheCreate(): Promise<void> {
    // On charge dynamiquement le module du dialog de création
    const { CreationDialog } = await import('../../../features/fiches/dialogs/creation/creation.dialog');

    // On ouvre le dialog de création et on gère la réponse
    this.dialog_service.open(CreationDialog, {}, {
      width: '90%',
      maxWidth: '42rem',
      maxHeight: '90dvh'
    }).pipe(
      // On filtre les réponses pour ne garder que celles où l'utilisateur a confirmé le dialog
      filter((response): response is DialogResponse => response?.confirmed === true),
      // On crée la fiche avec les données du dialog et on récupère l'ID de la fiche créée
      switchMap(({ data }) => this.fiches_service.create(data as FichePayload))
      // On navigue vers la fiche créée avec l'ID récupéré
    ).subscribe(async ({ id }) => await this.router.navigate(['/fiches', id]));
  }

  protected readonly CategoryColors = CategoryColors;
}
