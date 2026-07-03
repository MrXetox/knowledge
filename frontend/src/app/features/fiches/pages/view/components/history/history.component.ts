import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { JSONContent } from '@tiptap/core';

import { ArrayChange, Change, diffArrays, diffJson, diffWords } from 'diff';
import { FicheFieldChange, FicheHistory, FicheStep } from '../../../../models/fiches.model';
import { ViewerComponent } from '../../../../../../shared/ui/viewer/viewer.component';
import { CategoryComponent } from '../../../../components/category/category.component';

@Component({
  selector: 'app-history',
  imports: [
    DatePipe,
    ViewerComponent,
    CategoryComponent
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent {
  /**
   * Historique de la fiche à afficher
   * @readonly
   */
  readonly history = input.required<FicheHistory>();

  /**
   * Signal pour gérer l'état d'ouverture des détails de l'historique
   * @protected
   */
  protected readonly is_details_open = signal<boolean>(false);

  /**
   * Objet contenant les informations de style et de label pour chaque type d'historique (création, modification, archivage, désarchivage)
   * @protected
   */
  protected readonly type= computed(() => ({
    creation: {
      label: 'Création',
      dot: 'bg-success-base ring-success-base/25',
      badge:'bg-success-subtle text-success-strong border-success-border',
    },
    edit: {
      label: 'Modification',
      dot: 'bg-warning-focus ring-warning-focus/25',
      badge: 'bg-warning-subtle text-warning-strong border-warning-border',
    },
    archive: {
      label: 'Archivage',
      dot: 'bg-accent-base ring-accent-base/25',
      badge: 'bg-accent-subtle text-accent-strong border-accent-border',
    },
    unarchive: {
      label: 'Désarchivage',
      dot: 'bg-accent-base ring-accent-base/25',
      badge: 'bg-accent-subtle text-accent-strong border-accent-border',
    }
  })[this.history().type]);

  /**
   * Objet contenant les labels pour chaque champ modifié dans l'historique
   * @protected
   */
  protected readonly fields_details: Record<FicheFieldChange['field'], string> = {
    title: 'Titre',
    problem: 'Problème',
    notes: 'Notes',
    tags: 'Mots-clés',
    categories: 'Catégories',
    steps: 'Étape de résolutions',
    files: 'Fichiers'
  };

  /**
   * Bascule l'état d'ouverture des détails de l'historique
   * @protected
   */
  protected onDetailsView(): void {
    this.is_details_open.update(state => !state);
  }

  /**
   * Retourne la classe CSS correspondant à l'état d'un changement (ajouté, supprimé ou inchangé)
   *
   * @param part Objet contenant les informations sur l'état du changement (ajouté, supprimé)
   * @protected
   */
  protected getDiffClass(part: { added: boolean, removed: boolean }): string {
    if (part.added)
      return 'bg-success-subtle border-success-border text-success-strong';
    if (part.removed)
      return 'bg-danger-subtle border-danger-border text-danger-heavy line-through';
    return 'border-transparent';
  }

  /**
   * Retourne la différence entre deux chaînes de caractères sous forme de tableau d'objets Change
   *
   * @param old_value Ancienne valeur de la chaîne de caractères
   * @param new_value Nouvelle valeur de la chaîne de caractères
   * @protected
   */
  protected getWordsDiff(old_value: string | null, new_value: string | null): Change[] {
    return diffWords(old_value || '', new_value || '');
  }

  /**
   * Retourne la différence entre deux documents Tiptap sous forme de tableau d'objets contenant les informations sur l'état du changement (ajouté, supprimé) et la valeur du document
   *
   * @param old_json Ancien document Tiptap
   * @param new_json Nouveau document Tiptap
   * @protected
   */
  protected getTiptapDiff(old_json: JSONContent | null, new_json: JSONContent | null): { added: boolean, removed: boolean, value: JSONContent }[] {
    const old_doc = old_json ?? { type: 'doc', content: [] };
    const new_doc = new_json ?? { type: 'doc', content: [] };

    if (JSON.stringify(old_doc) === JSON.stringify(new_doc)) {
      return [{ added: false, removed: false, value: old_doc }];
    }

    return [
      { added: false, removed: true,  value: old_doc },
      { added: true,  removed: false, value: new_doc },
    ];
  }

  /**
   * Retourne la différence entre deux tableaux sous forme de tableau d'objets ArrayChange
   *
   * @param old_value Ancienne valeur du tableau
   * @param new_value Nouvelle valeur du tableau
   * @protected
   */
  protected getArrayDiff(old_value: any[] | null, new_value: any[] | null): ArrayChange<any>[] {
    return diffArrays(old_value || [], new_value || []);
  }

  /**
   * Retourne la différence entre deux tableaux d'étapes sous forme de tableau d'objets ArrayChange
   *
   * @param old_value Ancienne valeur du tableau d'étapes
   * @param new_value Nouvelle valeur du tableau d'étapes
   * @protected
   */
  protected getStepsDiff(
    old_value: any[] | null,
    new_value: any[] | null,
  ): ArrayChange<{
    text: string;
    image: string | undefined;
    is_substep: boolean;
    index: string;
  }>[] {
    const old_steps = this.flattenSteps(old_value);
    const new_steps = this.flattenSteps(new_value);

    console.log(diffArrays(old_steps, new_steps, {
      comparator: (left, right) => left.text === right.text && left.image == right.image,
    }))

    return diffArrays(old_steps, new_steps, {
      comparator: (left, right) => left.text === right.text && left.image == right.image,
    });
  }

  /**
   * Aplati les étapes et sous-étapes en un tableau d'objets contenant le texte, l'image, l'indice et un indicateur de sous-étape
   *
   * @param steps Tableau d'étapes à aplatir
   * @param prefix Préfixe pour l'indice des sous-étapes (utilisé pour la récursion)
   *
   * @returns Tableau d'objets aplatis représentant les étapes et sous-étapes
   * @private
   */
  private flattenSteps(
    steps: FicheStep[] | null,
    prefix = '',
  ): { text: string; image: string | undefined; is_substep: boolean; index: string }[] {
    if (!steps) return [];

    return steps.flatMap((step, index) => {
      const current_index = prefix ? `${prefix} . ${index + 1}` : `${index + 1}`;

      return [
        { text: step.text, image: step.image, is_substep: !!prefix, index: current_index },
        ...this.flattenSteps(step.substeps || [], current_index),
      ];
    });
  }

}
