import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import localeFr from '@angular/common/locales/fr'

import { provideNgIconLoader } from '@ng-icons/core';

import { routes } from './app.routes';
import { msal_providers } from "./core/utils/msal.config";

registerLocaleData(localeFr);

/**
 * Configuration globale de l'application
 * Définit les fournisseurs de services et le routeur
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideNgIconLoader(async (name) => {
      const icons = await import('./core/utils/lucide.config');
      return (icons as Record<string, string>)[name];
    }),
    ...msal_providers
  ]
};
