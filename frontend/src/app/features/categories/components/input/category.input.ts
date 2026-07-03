import { Component, computed, effect, input, linkedSignal, output, signal } from '@angular/core';
import { FieldTree, form, FormField, required, submit } from '@angular/forms/signals';

import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';

import { NgIcon } from '@ng-icons/core';

import { CategoryPayload } from '../../payload/categories.payload';
import { CategoryColors, CategoryIcons, CategoryNode } from '../../models/categories.model';

@Component({
  selector: 'app-category-input',
  imports: [
    NgIcon,
    FormField,
    Combobox,
    Listbox,
    Option,
    ComboboxPopup,
    ComboboxWidget,
    CdkConnectedOverlay
  ],
  templateUrl: './category.input.html',
  styleUrl: './category.input.css'
})
export class CategoryInput {
  /**
   * Variant du formulaire (création d'une catégorie ou d'une sous-catégorie)
   * @readonly
   */
  readonly variant = input.required<'category' | 'subcategory'>();

  /**
   * Catégorie à modifier (si le formulaire est utilisé pour l'édition)
   * @readonly
   */
  readonly category = input<CategoryNode>();

  /**
   * Événement émis lorsque le formulaire est soumis ou annulé
   * @readonly
   */
  readonly finish = output<CategoryPayload | undefined>();

  /**
   * Compteur statique pour générer des identifiants uniques pour chaque instance du composant
   * @private
   */
  private static counter = 0
  protected readonly uid = ++CategoryInput.counter;

  /**
   * Signal indiquant si le dropdown de sélection du spécial (icône ou couleur) est ouvert
   * @protected
   */
  protected readonly is_dropdown_open = signal<boolean>(false);

  /**
   * Mapping des couleurs associées aux catégories pour l'affichage
   * @protected
   */
  protected readonly CategoryColors = CategoryColors;
  protected specials_list = computed(() => this.variant() === 'category' ? CategoryIcons : Object.keys(CategoryColors));

  /**
   * Configuration des classes CSS pour les différents éléments du formulaire en fonction de la variante (catégorie ou sous-catégorie)
   * @protected
   */
  protected readonly variant_config = computed(() => ({
    category: {
      placeholder: 'Nom de la catégorie',
      input: 'px-2.5 py-1.5',
      add: 'px-4 py-1.5',
      cancel: 'px-3 py-1.5',
    },
    subcategory: {
      placeholder: 'Nom de la sous-catégorie',
      input: 'px-2.5 py-1 bg-primary-subtle',
      add: 'px-3 py-1',
      cancel: 'px-2.5 py-1',
    },
  })[this.variant()]);

  /**
   * Signal contenant les informations de la catégorie à créer ou modifier (nom et spécial)
   * @protected
   */
  private readonly payload = signal<CategoryPayload>({
    name: '',
    special: ''
  });

  /**
   * Formulaire réactif basé sur le payload, avec validation des champs requis
   * @protected
   */
  protected readonly form = form(this.payload, (path) => {
    required(path.name, { message: 'Le nom est requis' });
    required(path.special, { message: 'Le spécial est requis' });
  });

  /**
   * Signal contenant le spécial sélectionné sous forme de tableau pour l'affichage dans le dropdown
   * @protected
   */
  protected readonly selected_special = linkedSignal<string[]>(() => {
    const v = this.form.special().value();
    return v ? [v] : [];
  });

  /**
   * Constructeur du composant CategoryInput, qui initialise un effet pour synchroniser le payload avec la catégorie existante si elle est fournie
   */
  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.payload.set({
          name: category.name,
          special: category.special,
        })
      }
    });
  }

  /**
   * Vérifie si un champ doit afficher son message d'erreur
   *
   * @param field Champ du formulaire à surveiller
   *
   * @protected
   */
   protected showError(field: FieldTree<unknown>): boolean {
     const state = field();
     return state.invalid() && state.touched();
   }

  /**
   * Met à jour le payload avec le spécial sélectionné et ferme le dropdown
   * @protected
   */
  protected onSpecialCommit(): void {
    this.payload.update(payload => ({ ...payload, special: this.selected_special()[0] }));
    this.is_dropdown_open.set(false);
  }

  /**
   * Soumet le formulaire et émet l'événement finish avec le payload si la soumission est réussie
   * @protected
   */
  protected async onSubmit(): Promise<void> {
    await submit(this.form, async () => this.finish.emit(this.payload()));
  }

  /**
   * Annule l'opération et émet l'événement finish avec undefined
   * @protected
   */
  protected onCancel(): void {
    this.finish.emit(undefined);
  }
}
