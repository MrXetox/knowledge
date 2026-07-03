import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { NgIcon } from '@ng-icons/core';

import { ToastService } from './services/toast.service';
import { Toast } from './models/toast.model';

@Component({
  selector: 'app-toast',
  imports: [
    NgIcon
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  /**
   * Identifiant du toast à afficher
   * @readonly
   */
  readonly id = input.required<number>();

  /**
   * Injection du service de toast pour gérer l'affichage et la suppression des notifications
   * @private
   */
  private readonly toast_service = inject(ToastService);

  /**
   * Signal contenant le toast correspondant à l'ID fourni
   * @protected
   */
  protected readonly toast = computed<Toast>(() => {
    // On récupère le toast depuis notre service
    const toast = this.toast_service.get(this.id());
    // Si le toast n'existe pas, on lance une erreur
    if (!toast) throw new Error(`Toast with id ${this.id()} not found`);
    // Sinon, on retourne le toast
    return toast;
  });

  /**
   * Style du toast en fonction de son type (success, error, warning, info)
   * @protected
   */
  protected readonly style = computed(() => ({
    success: { colors: 'bg-success-subtle border-success-border text-success-strong', icon: 'lucideCheckCircle2' },
    error: { colors: 'bg-danger-subtle border-danger-border text-danger-strong', icon: 'lucideXCircle' },
    warning: { colors: 'bg-warning-subtle border-warning-border text-warning-strong', icon: 'lucideAlertTriangle' },
    info: { colors: 'bg-primary-subtle border-primary-border text-primary-strong', icon: 'lucideInfo' }
  })[this.toast().type]);

  /**
   * Signal indiquant si le toast est en train de se fermer (animation de sortie)
   * @protected
   */
  protected readonly is_closing = signal<boolean>(false);

  /**
   * Constructeur du composant ToastComponent
   * Initialise un effet pour gérer la fermeture automatique du toast après sa durée spécifiée
   */
  constructor() {
    // Initialisation d'un effet qui est trigger lorsque le composant reçoit le toast, et qui déclenche la fermeture automatique après la durée spécifiée dans le toast.
    effect(() => setTimeout(() => this.is_closing.set(true), this.toast().duration));
  }

  /**
   * Appelé quand l'animation de slide est terminée.
   * Supprime le toast du service si l'animation de sortie est terminée.
   */
  protected onAnimationEnd(): void {
    // Si le toast n'est pas en train de se fermer, on ne fait rien
    if (!this.is_closing()) return;

    // Supprime le toast du service de toast
    this.toast_service.remove(this.id());
  }
}
