import { Component, input, output, signal } from '@angular/core';
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-filedropzone-input',
    imports: [
        NgIcon
    ],
  templateUrl: './filedropzone.input.html',
  styleUrl: './filedropzone.input.css',
  host: {
    class: 'flex border border-dashed rounded-md overflow-hidden',
    '[class.border-solid]': 'is_file_dragged()',
  }
})
export class FiledropzoneInput {
  /**
   * Texte affiché dans le placeholder du champ de sélection de fichier
   * @readonly
   */
  readonly placeholder = input.required<string>();

  /**
   * Types de fichiers acceptés, formatés comme dans l'attribut HTML "accept" (ex: "image/*" ou ".pdf")
   * @readonly
   */
  readonly accept = input.required<string>();

  /**
   * Output émettant le fichier sélectionné ou glissé dans le champ
   * @readonly
   */
  readonly files = output<FileList>();

  /**
   * Signal d'état indiquant si un fichier est en cours de glissement sur le champ
   * @protected
   */
  protected is_file_dragged = signal<boolean>(false);

  /**
   * Appelé quand le champ est survolé
   *
   * @param event
   * @protected
   */
  protected onDragOver(event: DragEvent): void {
    // Empêche le comportement par défaut du navigateur (ouvrir le fichier)
    event.preventDefault();
    event.stopPropagation();

    // Indique que le fichier est en cours de glissement
    this.is_file_dragged.set(true);
  }

  /**
   * Appelé quand le champ n'est plus survolé
   *
   * @param event
   * @protected
   */
  protected onDragLeave(event: DragEvent): void {
    // Empêche le comportement par défaut du navigateur (ouvrir le fichier)
    event.preventDefault();
    event.stopPropagation();

    // Indique que le fichier n'est plus en cours de glissement
    this.is_file_dragged.set(false);
  }

  /**
   * Appelé quand un fichier a été glissé dans le champ
   * @protected
   */
  protected onFileDrop(event: DragEvent) {
    // Empêche le comportement par défaut du navigateur (ouvrir le fichier)
    event.preventDefault();
    event.stopPropagation();

    // Indique que le fichier n'est plus en cours de glissement
    const files = event.dataTransfer?.files;

    // Émet le fichier sélectionné
    if (files && files.length > 0) this.files.emit(files);
  }

  /**
   * Appelé quand un fichier a été sélectionné dans le champ
   * @protected
   */
  protected onFileSelect(event: Event) {
    // Émet le fichier sélectionné
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length === 1) this.files.emit(element.files);
  }
}
