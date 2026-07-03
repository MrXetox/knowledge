import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-tags-input',
  imports: [],
  templateUrl: './tags.input.html',
  styleUrl: './tags.input.css',
})
export class TagsInput implements FormValueControl<string[]>{
  /**
   * Permet d'établir un binding grâce à la directive [formField] pour modifier la valeur du formulaire parent.
   * @readonly
   */
  readonly value = model<string[]>([]);

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
   * Ajoute un tag dans l'input
   *
   * @param tag Tag à ajouter
   * @private
   */
  private addTag(tag: string): void {
    // Nettoie le tag en supprimant les virgules et les espaces inutiles
    const clean = tag.replace(/,/g, '').trim();

    // Si le tag est vide après nettoyage, on ne l'ajoute pas
    if (!clean) return;

    // Vérifie si le tag existe déjà dans la liste des tags, si oui, on ne l'ajoute pas
    if (this.value().includes(clean)) return;

    // Ajoute le tag à la liste des tags en utilisant la méthode update de la signal value
    this.value.update(tags => [...tags, clean]);
  }

  /**
   * Supprime un tag de l'input
   *
   * @param id
   * @protected
   */
  protected removeTag(id: number): void {
    this.value.update(tags => tags.filter((_, index) => index !== id));
  }

  /**
   * Ajoute un tag quand l'utilisateur appuie sur Entrée ou virgule
   *
   * @param event L'événement clavier déclenché par l'utilisateur
   * @protected
   */
  protected onKeydown(event: KeyboardEvent): void{
    // Si la touche pressée n'est pas Entrée ou virgule, on ne fait rien
    if (event.key !== 'Enter' && event.key !== ',') return;

    // Empêche le comportement par défaut de l'événement pour éviter que le formulaire ne soit soumis ou que la virgule soit ajoutée dans l'input
    event.preventDefault();

    // Récupère la valeur de l'input, supprime les espaces et réinitialise l'input
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    input.value = '';

    // Si la valeur est vide, on ne fait rien
    if (!value) return;

    // Ajoute le tag à l'input en utilisant la méthode addTag
    this.addTag(value);
  }

  /**
   * Gère le copier-coller de plusieurs tags séparés par des virgules
   *
   * @param event L'événement presse-papier déclenché par l'utilisateur
   * @protected
   */
  protected onPaste(event: ClipboardEvent): void {
    // Récupère le texte collé depuis le presse-papier
    const input = event.clipboardData?.getData('text') ?? '';

    // Sépare le texte collé en tags individuels, supprime les espaces et les tags vides
    const value = input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Si aucun tag n'est présent, on ne fait rien
    if (value.length === 0) return;

    // Empêche le comportement par défaut du collage pour éviter d'ajouter le texte directement dans l'input
    event.preventDefault();

    // Ajoute chaque tag à l'input en utilisant la méthode addTag
    value.forEach(tag => this.addTag(tag));
  }
}
