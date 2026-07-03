import { inject, Service } from '@angular/core';
import { Dialog, DialogConfig as CdkConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';

import { DialogConfig, DialogResponse } from '../models/dialog.model'
import { DialogComponent } from '../dialog.component';

@Service()
export class DialogService {
  /**
   * Injection du service de dialog d'Angular CDK pour gérer l'ouverture et la fermeture des dialogs
   * @private
   */
  private readonly dialog = inject(Dialog);

  /**
   * Créer un simple Dialog
   *
   * @param component Component du dialog
   * @param config Configuration du dialog
   * @param layout Configuration du layout pour adapter la taille de la fenêtre
   */
  open<C>(
    component: ComponentType<C>,
    config: DialogConfig,
    layout?: { maxWidth?: string; maxHeight?: string; width?: string; height?: string }
  ) {
    const options: CdkConfig<DialogConfig, DialogRef<DialogResponse, C>> = {
      data: config,
      hasBackdrop: true,
      disableClose: true,
      role: config.role === 'danger' ? 'alertdialog' : 'dialog',
      ariaLabelledBy: 'dialog-title',
      ariaDescribedBy: 'dialog-desc',
      ...layout,
    };

    const ref = this.dialog.open<DialogResponse, DialogConfig, C>(component, options);
    return ref.closed;
  }

  /**
   * Créer un Dialog en mode confirm
   *
   * @param config Configuration du dialog
   */
  confirm(config: DialogConfig) {
    return this.open(DialogComponent, { ...config, role: 'confirm' });
  }

  /**
   * Créer un Dialog en mode danger
   *
   * @param config Configuration du dialog
   */
  danger(config: DialogConfig) {
    return this.open(DialogComponent, { ...config, role: 'danger' });
  }
}
