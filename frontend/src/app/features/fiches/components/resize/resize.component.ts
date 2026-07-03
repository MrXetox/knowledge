import { Component, HostListener, model, signal } from '@angular/core';

@Component({
  selector: 'app-resize',
  imports: [],
  templateUrl: './resize.component.html',
  styleUrl: './resize.component.css',
})
export class ResizeComponent {
  /**
   * Signal représentant la taille actuelle du composant
   * @readonly
   */
  readonly size = model.required<number>()

  /**
   * Signal indiquant si le composant est en cours de redimensionnement
   * @private
   */
  private readonly is_resizing = signal<boolean>(false);

  /**
   * Coordonnées initiales de la souris lors du début du redimensionnement
   * @private
   */
  private start_x = 0;
  private start_width = 0;

  /**
   * Gestionnaire de l'événement mousedown pour initier le redimensionnement
   *
   * @param event Événement de souris déclenché lors du clic
   * @protected
   */
  protected onMouseDown(event: MouseEvent): void {
    this.is_resizing.set(true);

    this.start_x = event.clientX;
    this.start_width = this.size();
  }

  /**
   * Gestionnaire de l'événement mousemove pour ajuster la taille du composant pendant le redimensionnement
   * @param event Événement de souris déclenché lors du mouvement de la souris
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.is_resizing()) return;

    const delta_x = event.clientX - this.start_x;
    let new_width = this.start_width - delta_x;
    new_width = Math.max(window.innerWidth * (1 / 3), Math.min(new_width, window.innerWidth * (3 / 5)));

    this.size.set(new_width);
  }

  /**
   * Gestionnaire de l'événement mouseup pour terminer le redimensionnement
   */
  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.is_resizing()) this.is_resizing.set(false);
  }
}
