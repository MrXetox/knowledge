import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DashboardStats } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

@Service()
export class DashboardService {
  /**
   * Resource HTTP pour récupérer les statistiques du dashboard depuis l'API
   * @readonly
   */
  private readonly query = httpResource<DashboardStats>(() => `${environment.api_url}/dashboard/stats`);

  /**
   * Signaux exposés pour les composants
   *  - stats : contient les statistiques du dashboard
   *  - isLoading : indique si la requête est en cours
   *  - error : contient l'erreur si la requête a échoué
   * @protected
   */
  readonly stats = this.query.value.asReadonly();
  readonly isLoading = this.query.isLoading;
  readonly error = this.query.error;
}
