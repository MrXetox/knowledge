import { Component, inject, model, signal } from '@angular/core';
import {
  applyEach,
  FieldTree,
  form,
  FormField,
  minLength,
  required,
  SchemaPath, submit,
  validate, validateTree
} from '@angular/forms/signals';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from '@angular/cdk/drag-drop';

import { NgIcon } from '@ng-icons/core';

import { ExchangeService } from '../../services/exchange.service';
import { FichePayload } from '../../payloads/fiche.payload';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { EditorInput } from '../../../../shared/ui/editor/editor.input';
import { CategoriesInput } from './components/categories/categories.input';
import { TagsInput } from './components/tags/tags.input';
import { StepInput } from './components/step/step.input';
import { FiledropzoneInput } from '../../../../shared/ui/filedropzone/filedropzone.input';

@Component({
  selector: 'app-creation-dialog',
  imports: [
    NgIcon,
    FormField,
    EditorInput,
    CategoriesInput,
    TagsInput,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    StepInput,
    CdkDropList,
    DialogComponent,
    FiledropzoneInput
  ],
  templateUrl: './creation.dialog.html',
  styleUrl: './creation.dialog.css'
})
export class CreationDialog {
  /**
   * Injection de DialogRef
   * Permet de gérer le dialog
   * @private
   */
  private readonly dialog_ref = inject(DialogRef);

  /**
   * Injection de DIALOG_DATA
   *  Peut contenir :
   *    - fiche : Les données d'une fiche existante pour préremplir le formulaire
   * @readonly
   */
  protected readonly data = inject(DIALOG_DATA) as { data?: FichePayload };

  /**
   * Injection d'ExchangeService pour l'import des fiches et l'upload des images
   * @private
   */
  private readonly exchange_service = inject(ExchangeService);

  /**
   * Payload initial fourni par DIALOG_DATA,
   *
   * NOTE : La transformation en JSON permet de détecter les changements et éviter d'envoyer une requête serveur alors que le payload n'a pas changé.
   * @private
   */
  private readonly initial_payload = JSON.stringify({
    title: this.data?.data?.title ?? '',
    categories: this.data?.data?.categories ?? [],
    problem: this.data?.data?.problem ?? { type: 'doc', content: [ { type: 'paragraph' } ] },
    steps: this.data?.data?.steps ?? [],
    notes: this.data?.data?.notes ?? { type: 'doc', content: [ { type: 'paragraph' } ] },
    tags: this.data?.data?.tags ?? [],
  });

  /**
   * Signal comportant le payload du formulaire
   * @private
   */
  private readonly payload = signal<FichePayload>(JSON.parse(this.initial_payload));

  /**
   * Formulaire réactif avec validation des données de chaque champ
   * @protected
   */
  protected readonly form = form(this.payload, path => {
    required(path.title, { message: 'Le titre est requis' });
    minLength(path.title, 5, { message: 'Le titre doit faire au moins 5 caractères' });

    this.richTextMinLength(path.problem, 10, {
      required_message: 'Le problème est requis',
      length_message: 'Le problème doit faire au moins 20 caractères',
    });

    validate(path.categories, ({ value }) =>
      value().length === 0
        ? { kind: 'minItems', message: 'Ajoutez au moins une catégorie' }
        : null
    );

    applyEach(path.steps, (step) => {
      required(step.text, { message: "L'étape doit être remplie" });

      if (step.substeps)
        applyEach(step.substeps, (substep) =>
          required(substep.text, { message: 'La sous-étape doit être remplie' }),
        );
    });

    validate(path.tags, ({ value }) =>
      value().length < 3 ? { kind: 'minItems', message: 'Ajoutez au moins 3 mots-clés' } : null,
    );

    validateTree(path, ({ value, fieldTree }) => {
      const { steps, notes } = value();

      const has_steps = steps.length > 0;
      const has_notes = this.tiptapText(notes).length > 0;

      if (!has_steps && !has_notes)
        return [
          { kind: 'stepsOrNotes', message: 'Renseignez au moins une étape ou une note', fieldTree: fieldTree.steps  },
          { kind: 'stepsOrNotes', message: 'Renseignez au moins une étape ou une note', fieldTree: fieldTree.notes  },
        ];

      return null;
    });
  });

  /**
   * Transforme le JSON de Tiptap en texte en concaténant le content des nodes
   *
   * @param doc Le JSON du document Tiptap
   * @private
   */
  private tiptapText(doc: unknown): string {
    // On vérifie que le document est un objet valide
    if (!doc || typeof doc !== 'object') return '';

    // On récupère le texte du node courant
    const node = doc as { text?: string; content?: unknown[] };
    let text = typeof node.text === 'string' ? node.text : '';

    // On parcourt récursivement le content des nodes pour récupérer le texte
    if (Array.isArray(node.content))
      for (const child of node.content) text += this.tiptapText(child);

    return text;
  }

  /**
   * Validator spécial pour les richtext Tiptap
   *
   * Vérifie si le champ n'est pas vide et contient un minimum de caractères selon le paramètre
   *
   * @param path Champ à vérifier
   * @param min Nombre minimum de caractères
   * @param options Messages d'erreur personnalisés (required_message, length_message)
   * @private
   */
  private richTextMinLength<T>(
    path: SchemaPath<T>,
    min: number,
    options?: { required_message? : string, length_message? : string }
  ): void {
    validate(path, ({ value }) => {
      const length = this.tiptapText(value()).trim().length;

      if (length === 0)
        return { kind: 'required', message: options?.required_message ?? 'Ce champ est requis' };

      if (length < min)
        return { kind: 'minLength', message: options?.length_message ?? `Minimum ${ min } caractères` };

      return null;
    });
  }

  /**
   * Vérifie si un champ doit afficher son message d'erreur
   *
   * @param field Champ du formulaire à surveiller
   * @protected
   */
  protected showError(field: FieldTree<unknown>): boolean {
    return field().invalid() && field().touched();
  }

  /**
   * Envoi le fichier compressé au service pour transformer les informations du fichier compressé en fiche et les importe dans le payload du formulaire.
   *
   * @param zip le fichier compressé
   * @private
   */
  protected processFiche(zip: FileList): void {
    this.exchange_service.import(zip[0]).then(fiche => this.payload.update(value => ({ ...value, ...fiche })));
  }

  /**
   * Appelée lors du drag & drop d'une étape pour réordonner les étapes dans le formulaire
   * @param event Événement de drag & drop contenant les informations sur l'élément déplacé et sa nouvelle position
   * @protected
   */
  protected onStepDrop(event: CdkDragDrop<string[]>): void {
    this.form.steps().value.update((steps) => {
      const new_steps = [...steps];
      moveItemInArray(new_steps, event.previousIndex, event.currentIndex);
      return new_steps;
    });
  }

  /**
   * Ajoute une étape dans le formulaire
   * @protected
   */
  protected onStepAdd(): void {
    this.form.steps().value.update(steps => [...steps, {
      text: '',
      substeps: []
    }]);
  }

  /**
   * Ajoute une sous-étape dans le formulaire
   *
   * @param id ID de l'étape qui va contenir la sous-étape
   * @protected
   */
  protected onSubstepAdd(id: number): void {
    this.form.steps().value.update(steps =>
      steps.map(((step, index) =>
          index == id
            ? { ...step, substeps: [...(step.substeps ?? []), { text: '' }] }
            : step
      ))
    );
  }

  /**
   * Supprime une étape dans le formulaire
   *
   * @param id ID de l'étape à supprimer
   * @protected
   */
  protected onStepRemove(id: number): void {
    this.form.steps().value.update(steps => steps.filter((_, index) => index !== id));
  }

  /**
   * Supprime une sous-étape dans le formulaire
   *
   * @param step_id ID de l'étape
   * @param substep_id ID de la sous-étape
   * @protected
   */
  protected onSubstepRemove(step_id: number, substep_id: number): void {
    this.form.steps().value.update(steps =>
      steps.map(((step, index) =>
          index == step_id
            ? { ...step, substeps: step.substeps!.filter((_, index) => index !== substep_id) }
            : step
      ))
    );
  }

  /**
   * Appelée lors de la confirmation du dialog
   * Valide le formulaire et ferme le dialog avec les données sélectionnées
   * @protected
   */
  protected onConfirmed = async () => {
    await submit(this.form, async () => {
      const has_changed = JSON.stringify(this.payload()) !== this.initial_payload;

      if (!has_changed) {
        this.dialog_ref.close();
        return;
      }

      this.dialog_ref.close({ confirmed: true, data: this.payload() });
    })
  }
}
