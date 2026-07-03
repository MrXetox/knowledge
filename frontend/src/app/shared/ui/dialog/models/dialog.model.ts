/**
 * Interface de configuration d'un dialog
 * Permet de personnaliser l'affichage et les actions d'un dialog
 */
export interface DialogConfig {
  title?: string;
  message?: string;
  confirm_label?: string;
  role?: 'confirm' | 'danger';
  data?: unknown;
}

/**
 * Interface de réponse générique d'un dialog
 * Retournée après la fermeture du dialog
 */
export interface DialogResponse {
  confirmed: boolean;
  data: unknown;
}
