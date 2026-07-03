import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { DatePipe, I18nPluralPipe } from '@angular/common';
import { Router } from '@angular/router';

import { filter, switchMap } from 'rxjs';

import { NgIcon } from '@ng-icons/core';

import { JSONContent } from '@tiptap/core';

import { FichesService } from '../../services/fiches.service';
import { DialogService } from '../../../../shared/ui/dialog/services/dialog.service';
import { CompactPipe } from '../../../../shared/utils/pipes/compact.pipe';
import { Fiche } from '../../models/fiches.model';
import { DialogResponse } from '../../../../shared/ui/dialog/models/dialog.model';
import { FicheExport, FichePayload } from '../../payloads/fiche.payload';
import { UnarchiveDialog } from '../../dialogs/unarchive/unarchive.dialog';
import { CategoryComponent } from '../../components/category/category.component';
import { ViewerComponent } from '../../../../shared/ui/viewer/viewer.component';
import { HistoryComponent } from './components/history/history.component';
import { ImageComponent } from '../../../../shared/ui/image/image.component';

@Component({
  selector: 'app-view',
  imports: [
    CategoryComponent,
    DatePipe,
    CompactPipe,
    HistoryComponent,
    I18nPluralPipe,
    ViewerComponent,
    NgIcon,
    ImageComponent,
  ],
  templateUrl: './view.page.html',
  styleUrl: './view.page.css'
})
export class ViewPage {
  /**
   * ID de la fiche à afficher
   * @readonly
   */
  readonly id = input<number>();

  /**
   * Fiche initiale à afficher
   * @readonly
   */
  readonly initial_fiche = input.required<Fiche>();

  /**
   * Injection du service Router pour la navigation
   * @private
   */
  private readonly router = inject(Router);

  /**
   * Injection du service FichesService pour la gestion des fiches
   * @private
   */
  private readonly fiches_service = inject(FichesService);

  /**
   * Injection du service DialogService pour la gestion des dialogues
   * @private
   */
  private readonly dialog_service = inject(DialogService);

  /**
   * Signal pour gérer l'état de la fiche affichée
   * @private
   */
  private readonly state = linkedSignal<Fiche>(() => this.initial_fiche());

  /**
   * Signal en lecture seule pour accéder à la fiche affichée
   * @protected
   */
  protected readonly fiche = this.state.asReadonly();

  /**
   * Signal pour gérer l'état d'ouverture de l'historique de la fiche
   * @protected
   */
  protected readonly is_history_open = signal<boolean>(false);

  /**
   * Bascule l'état d'ouverture de l'historique de la fiche
   * @protected
   */
  protected onClick(): void {
    this.is_history_open.update(state => !state);
  }

  /**
   * Vérifie si un champ de type JSONContent est vide
   *
   * @param text Champ de type JSONContent à vérifier
   * @returns true si le champ est vide, false sinon
   * @protected
   */
  protected isFieldEmpty(text: JSONContent): boolean {
    if (!text) return true;
    if (!text.content || text.content.length === 0) return true;
    return text.content.length === 1 && text.content[0].type === 'paragraph' && (!text.content[0].content || text.content[0].content.length === 0);
  }

  /**
   * Ouvre le dialogue de modification de la fiche et met à jour l'état de la fiche après la modification
   * @protected
   */
  protected async onEdit(): Promise<void> {
    const { CreationDialog } = await import('../../dialogs/creation/creation.dialog');
    this.dialog_service.open(CreationDialog, {
      data: this.fiche()
    }, {
      width: '90%',
      maxWidth: '42rem',
      maxHeight: '90dvh'
    }).pipe(
      filter((response): response is DialogResponse => response?.confirmed === true),
      switchMap(({ data }) => this.fiches_service.update(this.fiche().id, data as FichePayload))
    ).subscribe(fiche => this.state.set(fiche));
  }

  /**
   * Ouvre le dialogue de confirmation pour archiver ou désarchiver la fiche et met à jour l'état de la fiche après l'action
   * @protected
   */
  protected onArchive(): void {
    const archived = this.fiche().archived;

    const config = {
      title: `${archived ? 'Désarchiver' : 'Archiver'} ${this.fiche().title}`,
      message: 'Êtes-vous sûr de vouloir archiver cette fiche ?',
    };

    const dialog$ = archived
      ? this.dialog_service.open(UnarchiveDialog, config)
      : this.dialog_service.confirm(config);

    dialog$
      .pipe(
        filter((response): response is DialogResponse => response?.confirmed === true),
        switchMap(({ data }) => this.fiches_service.update(this.fiche().id, { archived: !archived, categories: data as number[] }))
      )
      .subscribe(fiche => this.state.set(fiche));
  }

  /**
   * Télécharge la fiche actuelle sous forme de fichier compressé
   * @protected
   */
  protected async onDownload() {
    const fiche = this.fiche();

    const article_export: FicheExport = {
      title: fiche.title,
      tags: fiche.tags,
      problem: fiche.problem,
      steps: fiche.steps,
      notes: fiche.notes,
    };

    const file = await this.fiches_service.download(article_export);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `${fiche.title}.zip`;
    link.click();
    link.remove();
  }

  /**
   * Ouvre le dialogue de confirmation pour supprimer la fiche et navigue vers la liste des fiches après la suppression
   * @protected
   */
  protected onDelete() {
    this.dialog_service.danger({
      title: `Supprimer ${this.fiche().title}`,
      message: 'Êtes-vous sûr de vouloir supprimer cette fiche ?'
    })
      .pipe(
        filter(response => !!response?.confirmed),
        switchMap(() => this.fiches_service.delete(this.fiche().id))
      )
      .subscribe(async () => {
        await this.router.navigate([ '/fiches' ], {
          queryParamsHandling: 'preserve'
        });
      });
  }
}
