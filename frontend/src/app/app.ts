import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';

import { ToastService } from './core/layout/toast/services/toast.service';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { ToastComponent } from './core/layout/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [ SidebarComponent, RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  /**
   * Titre affiché sur la sidebar
   * @protected
   */
  protected readonly title = environment.app_name;

  /**
   * Sous-titre affiché sur la sidebar
   * @protected
   */
  protected readonly subtitle = environment.service_name;

  /**
   * Signal contenant la liste des toasts à afficher, injecté depuis le service ToastService
   * @private
   */
  protected readonly toasts = inject(ToastService).toasts;

  /**
   * Séquence de touches du Konami Code pour activer le mode "snake" (secret)
   * @private
   */
  private readonly sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  /**
   * Séquence de touches actuellement saisie par l'utilisateur pour vérifier si elle correspond au Konami Code
   * @private
   */
  private current_sequence: string[] = [];

  /**
   * Signal indiquant si le mode "snake" est activé
   * @protected
   */
  protected readonly snake = signal<boolean>(false);

  /**
   * Gère l'activation du mode "snake" lorsque la séquence de touches est correctement saisie
   * @param event Évènement de la touche pressée
   */
  @HostListener('window:keydown', ['$event'])
  onSnake(event: KeyboardEvent): void {
    // Si le snake est déjà activé, on ne fait rien
    if (this.snake()) return;

    // On enregistre la touche pressée dans la séquence actuelle
    this.current_sequence.push(event.key);

    // Si on dépasse la taille du Konami code, alors on retire le premier element de la séquence pour ne garder que les dernières
    if (this.current_sequence.length > this.sequence.length) this.current_sequence.shift();

    // Si la séquence actuelle correspond au Konami code, on active le mode "snake" et on réinitialise la séquence actuelle
    if (this.sequence.every(
      (key, index) => key === this.current_sequence[index]
    )) {
      this.snake.set(true);
      this.current_sequence = [];
    }
  }

  /**
   * Gère la fermeture du mode "snake" lorsque la fenêtre perd le focus
   */
  @HostListener('window:focus')
  onSnakeClose(): void {
    // Si le snake n'est pas activé, on ne fait rien
    if (!this.snake()) return;

    // On désactive le mode "snake" lorsque la fenêtre perd le focus
    this.snake.set(false);
  }
}
