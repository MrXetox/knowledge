import { Component, computed, input } from '@angular/core';
import { DatePipe, I18nPluralPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CompactPipe } from '../../../../shared/utils/pipes/compact.pipe';
import { Card } from '../../models/fiches.model';
import { CategoryComponent } from '../category/category.component';

@Component({
  selector: 'app-card',
  imports: [
    RouterLinkActive,
    I18nPluralPipe,
    CompactPipe,
    DatePipe,
    CategoryComponent,
    RouterLink
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  /**
   * Fiche à afficher dans la carte
   * @readonly
   */
  readonly card = input.required<Card>();

  /**
   * Inputs de configuration de la carte
   *  - Variant d'une fiche (full, mini, ranking)
   *  - Si la variante ranking a été choisie, il faut fournir le rank.
   */
  readonly variant = input<'full' | 'mini' | 'ranking'>('full');
  readonly rank = input<number>(0);

  /**
   * Classes CSS pour le style de la carte en fonction du rang
   * @protected
   */
  protected readonly rank_class = computed(() => ({
    1: 'bg-warning-muted border-warning-border text-warning-strong',
    2: 'bg-bg-muted border-border-default text-text-subtle',
    3: 'bg-danger-subtle border-danger-border text-danger-strong'
  })[this.rank()]);
}
