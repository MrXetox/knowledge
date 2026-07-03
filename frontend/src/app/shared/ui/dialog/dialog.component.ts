import { Component, inject, input } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { DialogConfig } from './models/dialog.model';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  /**
   * Injection de la référence du dialog pour pouvoir le fermer avec un résultat
   * @private
   */
  private readonly dialog_ref = inject(DialogRef);

  /**
   * Injection de la configuration du dialog (titre, message, labels, etc.)
   * @private
   */
  private readonly config = inject<DialogConfig>(DIALOG_DATA, { optional: true });

  /**
   * Titre principal affiché dans le header du dialog.
   * @readonly
   */
  readonly title = input<string>(this.config?.title ?? 'Titre');

  /**
   * Corps du message d'explication ou d'avertissement.
   * @readonly
   */
  readonly message = input<string>(this.config?.message ?? '');

  /**
   * Texte affiché dans le bouton d'action principal.
   * @readonly
   */
  readonly confirm_label = input<string>(this.config?.confirm_label ?? 'Confirmer');

  /**
   * Texte affiché dans le bouton d'action secondaire (annuler).
   * @readonly
   */
  readonly role = input<string>(this.config?.role ?? 'confirm');

  /**
   * Fonction appelée lorsque l'utilisateur clique sur le bouton de confirmation. Ferme le dialog avec un résultat positif.
   * @readonly
   */
  readonly confirm = input<() => void>(() => this.dialog_ref.close({ confirmed: true }));

  /**
   * Fonction appelée lorsque l'utilisateur clique sur le bouton d'annulation. Ferme le dialog avec un résultat négatif.
   * @readonly
   */
  readonly cancel = input<() => void>(() => this.dialog_ref.close({ confirmed: false }));
}
