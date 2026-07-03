import { Component, inject, input, model } from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';

import { ExchangeService } from '../../../../services/exchange.service';
import { FicheStep } from '../../../../models/fiches.model';
import { FiledropzoneInput } from '../../../../../../shared/ui/filedropzone/filedropzone.input';
import { ImageComponent } from '../../../../../../shared/ui/image/image.component';

@Component({
  selector: 'app-step-input',
  imports: [
    FormField,
    FiledropzoneInput,
    ImageComponent
  ],
  templateUrl: './step.input.html',
  styleUrl: './step.input.css',
})
export class StepInput implements FormValueControl<FicheStep> {
  /**
   * Permet d'établir un binding grâce à la directive [formField] pour modifier la valeur du formulaire parent.
   * @readonly
   */
  readonly value = model<FicheStep>({
    text: ''
  });

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
   * Texte décrivant le champ pour l'utilisateur, affiché dans le placeholder de l'éditeur
   * @readonly
   */
  readonly placeholder = input<string>('');

  /**
   * Injection d'ExchangeService pour l'import des fiches et l'upload des images
   * @private
   */
  private readonly exchange_service = inject(ExchangeService);

  /**
   * Formulaire réactif lié à la valeur du composant.
   * @protected
   */
  protected readonly form = form(this.value);


  /**
   * Upload l'image via le service d'upload
   *
   * @param files Liste de fichiers à uploader (normalement un seul fichier)
   * @private
   */
  protected processImage(files: FileList): void {
    const image = files[0];
    if (!image.type.startsWith('image/')) return;

    this.exchange_service.upload(image)
      .subscribe(({ url }) => this.form().value.update(
        step => ({ ...step, image: url })
      ));
  }

  /**
   * Appelé quand une image a été envoyé depuis le presse-papier
   *
   * @param event ClipboardEvent de l'envoi de l'image.
   * @protected
   */
  protected onImagePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const data = event.clipboardData;
    if (data && data.files && data.files.length === 1) this.processImage(data.files);
  }

  /**
   * Appelé quand une image a été uploadé depuis le filedropzone
   * @protected
   */
  protected onImageDelete(): void {
    this.form().value.update(
      step => ({...step, image: undefined})
    );
  }
}
