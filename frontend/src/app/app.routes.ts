import { Routes } from '@angular/router';
import { ficheResolver } from './features/fiches/resolvers/fiche.resolver';
import { authGuard } from "./core/guards/auth.guard";

/**
 * Tableau de routes de l'application
 * Configure les chemins disponibles et charge les composants correspondants
 */
export const routes: Routes = [
  {
    path: 'accueil',
    loadComponent: () => import('./features/dashboard/dashboard.page').then(c => c.DashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'manage',
    loadComponent: () => import('./features/categories/manage.page').then(c => c.ManagePage),
    canActivate: [authGuard]
  },
  {
    path: 'fiches',
    loadComponent: () => import('./features/fiches/pages/list/list.page').then(c => c.ListPage),
    children: [
      {
        path: ':id',
        resolve: { initial_fiche: ficheResolver },
        loadComponent: () => import('./features/fiches/pages/view/view.page').then(c => c.ViewPage),
        canActivate: [authGuard]
      }
    ],
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'accueil',
  }
];
