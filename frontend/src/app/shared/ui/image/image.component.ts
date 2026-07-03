import { Component, effect, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-image',
  imports: [
    NgOptimizedImage,
    NgIcon
  ],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  /**
   * Source de l'image (le lien pointant vers l'image)
   * @readonly
   */
  readonly src = input.required<string>();

  /**
   * Indique le contenu de l'image pour les lecteurs d'écran et l'accessibilité
   * @readonly
   */
  readonly alt = input<string>('Image');

  /**
   * Signal d'état de chargement de l'image
   * NOTE : Ce signal sert surtout pour que le composant puisse récupérer les dimensions de l'image afin de l'afficher correctement.
   * @protected
   */
  protected readonly is_loading = signal<boolean>(true);

  /**
   * Signal contenant la largeur de l'image
   * @protected
   */
  protected readonly width = signal<number>(800);

  /**
   * Signal contenant la hauteur de l'image
   * @protected
   */
  protected readonly height = signal<number>(600);

  /**
   * Signal contenant l'état de zoom de l'image
   * @protected
   */
  protected readonly is_zoomed = signal<boolean>(false);

  constructor() {
    effect(() => {
      const image = new Image();
      image.src = this.src();
      this.is_loading.set(true);

      image.onload = () => {
        this.width.set(image.width);
        this.height.set(image.height);
        this.is_loading.set(false);
      };
    });
  }

  /**
   * Appelé quand l'image a été cliquée pour zoomer
   * @protected
   */
  protected onZoomIn() {
    this.is_zoomed.set(true);
  }

  /**
   * Appelé quand l'image a été cliquée pour dézoomer
   * @protected
   */
  protected onZoomOut() {
    this.is_zoomed.set(false);
  }
}
