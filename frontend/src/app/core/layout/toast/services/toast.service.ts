import { Service, signal } from '@angular/core';

import { Toast } from '../models/toast.model';

@Service()
export class ToastService {
  /**
   * Signal contenant les toasts à afficher
   * @private
   */
  private readonly cache = signal<Toast[]>([]);

  /**
   * Signal en lecture seule pour les composants qui souhaitent s'abonner aux toasts
   * @readonly
   */
  readonly toasts = this.cache.asReadonly();

  /**
   * Compteur interne pour attribuer un ID unique à chaque toast
   * @private
   */
  private next_id = 0;

  /**
   * Affiche un toast avec un message, un type et une durée
   * NOTE : Les messages vides sont ignorés.
   *
   * @param message Le message à afficher
   * @param type Le type du toast ('success' | 'error' | 'info' | 'warning')
   * @param duration Durée en millisecondes avant la fermeture automatique (par défaut 5000ms)
   */
  show(message: string, type: Toast['type'], duration: number = 5000): void {
    // S'il n'y a pas de message ou qu'il est vide, alors on ne fait rien
    if (!message || message.trim().length < 1) return;
    // On supprime les espaces inutiles au début et à la fin du message
    message = message.trim();

    // On génère un ID unique pour le toast et on l'ajoute à la liste des toasts
    const id = this.next_id++;

    // On met à jour le signal avec le nouveau toast
    this.cache.update(current => [...current, { id, message, type, duration }]);
  }

  /**
   * Récupère un toast par son ID
   *
   * @param id ID du toast
   * @returns Le toast correspondant à l'ID, ou undefined si non trouvé
   */
  get(id: number): Toast | undefined {
    return this.cache().find(toast => toast.id === id);
  }

  /**
   * Supprime définitivement un toast de la liste
   * @param id ID du toast
   */
  remove(id: number): void {
    this.cache.update(current => current.filter(toast => toast.id !== id));
  }

  /**
   * Raccourcis pour les différents types de toast
   *
   * @param message Le message à afficher
   * @param duration La durée avant la fermeture automatique
   */
  success(message: string, duration?: number): void { this.show(message, 'success', duration); }
  warning(message: string, duration?: number): void { this.show(message, 'warning', duration); }
  error(message: string, duration?: number): void { this.show(message, 'error', duration); }
  info(message: string, duration?: number): void { this.show(message, 'info', duration); }
}
