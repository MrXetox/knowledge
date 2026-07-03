import { Component, effect, inject, signal, } from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { NgIcon } from '@ng-icons/core';

import { FichesService } from '../../services/fiches.service';
import { SearchbarComponent } from '../../../../shared/ui/searchbar/searchbar.component';
import { CardComponent } from '../../components/card/card.component';
import { ResizeComponent } from '../../components/resize/resize.component';

@Component({
  selector: 'app-fiches-list',
  imports: [
    SearchbarComponent,
    I18nPluralPipe,
    NgIcon,
    CardComponent,
    RouterOutlet,
    ResizeComponent
  ],
  templateUrl: './list.page.html',
  styleUrl: './list.page.css'
})
export class ListPage {
  /**
   * Injection du service FichesService pour la gestion des fiches
   * @private
   */
  private readonly fiches_service = inject(FichesService);

  /**
   * Injection du service Router pour la navigation
   * @private
   */
  private readonly router = inject(Router);

  /**
   * Injection du service ActivatedRoute pour récupérer les paramètres de la route
   * @private
   */
  private readonly route = inject(ActivatedRoute);

  /**
   * Taille de la fiche ouverte, utilisée pour l'affichage responsive
   * @protected
   */
  protected size = signal<number>(0);


  /**
   * Signaux pour les cartes, l'état de chargement et les erreurs
   * @protected
   */
  protected readonly cards = this.fiches_service.cards;
  protected readonly isLoading = this.fiches_service.isLoading;
  protected readonly error = this.fiches_service.error;

  /**
   * Constructor pour déclencher la recherche des fiches à chaque changement de paramètres de la route
   */
  constructor() {
    this.route.queryParams.subscribe(params => this.fiches_service.search(params));

    effect(async () => {
      const cards = this.cards();
      if (cards.length !== 1) return;

      await this.router.navigate(['/fiches', cards[0].id], {
        queryParamsHandling: 'preserve'
      });
    });
  }

  /**
   * Déclenché quand l'utilisateur scroll jusqu'en bas de la liste des fiches
   *
   * @param event Événement de scroll
   * @protected
   */
  protected onScrollEnd(event: Event): void {
    const element = event.target as HTMLElement;
    if ((element.scrollHeight - element.scrollTop) > element.clientHeight || this.isLoading() || this.cards().length === 0) return;
    this.fiches_service.load(this.cards().length);
  }

  /**
   * Déclenché quand le composant enfant de la fiche est chargé
   * @protected
   */
  protected onActivated(): void {
    if (this.size() === 0) this.size.set(window.innerWidth / 3);
  }

  /**
   * Déclenché quand l'utilisateur quitte la fiche (ferme la fiche)
   * @protected
   */
  protected onDeactivated(): void {
    this.size.set(0);
  }
}
