import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-searchbar',
  imports: [
    NgIcon
  ],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css'
})
export class SearchbarComponent {
  /**
   * Injection du service Router pour naviguer vers la route de recherche
   * @private
   */
  private readonly router = inject(Router);

  /**
   * Injection du service ActivatedRoute pour accéder aux paramètres de la route
   * @private
   */
  private readonly route = inject(ActivatedRoute);

  /**
   * Valeur initiale de l'input de recherche, récupérée depuis les paramètres de la route
   * @protected
   */
  protected readonly initial_value = this.route.snapshot.queryParams['search'] || '';

  /**
   * Gère le changement de valeur de l'input de recherche et met à jour les paramètres de la route
   * @param event Évènement de l'input de recherche
   *
   * @protected
   */
  protected async onChange(event: Event) {
    // On redirige vers la route /fiches avec le paramètre de recherche mis à jour
    await this.router.navigate(['/fiches'], {
      queryParams: {
        search: (event.target as HTMLInputElement).value
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
