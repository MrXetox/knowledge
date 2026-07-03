import { Component, inject, signal } from '@angular/core';
import { form, FormField, submit, validate } from '@angular/forms/signals';

import { DialogComponent } from "../../../../shared/ui/dialog/dialog.component";
import { CategoriesInput } from '../creation/components/categories/categories.input';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-unarchive-dialog',
  imports: [
    CategoriesInput,
    FormField,
    DialogComponent
  ],
  templateUrl: './unarchive.dialog.html',
  styleUrl: './unarchive.dialog.css',
})
export class UnarchiveDialog {
  /**
   * Injection de DialogRef pour gérer le dialog
   * @private
   */
  private readonly dialog_ref = inject(DialogRef);

  /**
   * Signal contenant les catégories sélectionnées
   * @private
   */
  private readonly payload = signal<number[]>([]);

  /**
   * Formulaire réactif pour la sélection des catégories
   * @protected
   */
  protected readonly form = form(this.payload, path => {
    validate(path, ({ value }) =>
      value().length === 0
        ? { kind: 'minItems', message: 'Ajoutez au moins une catégorie' }
        : null
    );
  });

  /**
   * Appelée lors de la confirmation du dialog
   * Valide le formulaire et ferme le dialog avec les données sélectionnées
   * @protected
   */
  protected onConfirmed = async () => {
    await submit(this.form, async () => this.dialog_ref.close({ confirmed: true, data: this.payload() }));
  }
}
