import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nPluralPipe } from '@angular/common';

import { NgIcon } from '@ng-icons/core';

import { environment } from '../../../environments/environment';

import { CategoriesService } from '../categories/services/categories.service';
import { DashboardService } from './services/dashboard.service';

import { CompactPipe } from '../../shared/utils/pipes/compact.pipe';

import { SearchbarComponent } from '../../shared/ui/searchbar/searchbar.component';
import { CardComponent } from '../fiches/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SearchbarComponent,
    RouterLink,
    I18nPluralPipe,
    CompactPipe,
    NgIcon,
    CardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage {

  /**
   * Injection du service DashboardService pour récupérer les statistiques du dashboard
   * @protected
   */
  protected readonly dashboard_service = inject(DashboardService);

  /**
   * Injection du service CategoriesService pour récupérer les catégories de l'application
   * @private
   */
  private readonly categories_service = inject(CategoriesService);

  /**
   * Heure actuelle pour déterminer le message de bienvenue
   * @protected
   */
  protected readonly hours = new Date().getHours();

  /**
   * Nom de l'application pour l'affichage dans le dashboard
   * @protected
   */
  protected readonly app_name = environment.app_name;

  /**
   * Statistiques du dashboard (nombre de fiches, catégories, etc.)
   * @protected
   */
  protected readonly stats = this.dashboard_service.stats;

  /**
   * Indique si les statistiques sont en cours de chargement
   * @protected
   */
  protected readonly isLoading = this.dashboard_service.isLoading;

  /**
   * Contient l'erreur si la récupération des statistiques a échoué
   * @protected
   */
  protected readonly error = this.dashboard_service.error;

  /**
   * Liste des catégories et sous-catégories pour l'affichage dans le dashboard
   * @protected
   */
  protected readonly categories = this.categories_service.tree;

  /**
   * Compte le nombre de catégories pour l'affichage dans le dashboard
   * @protected
   */
  protected readonly categories_count = computed(() => this.categories_service.categories().length);
}
