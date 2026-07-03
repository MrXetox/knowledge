import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe de formatage compact des nombres
 * Transforme les nombres en notation compacte (ex: 1000 -> 1k)
 */
@Pipe({
  name: 'compact',
})
export class CompactPipe implements PipeTransform {
  /**
   * Transforme un nombre en notation compacte
   * @param value Le nombre à transformer
   * @returns Le nombre formaté en notation compacte
   */
  transform(value: number): string {
    // Utilisation de l'API Intl pour formater le nombre en notation compacte
    return Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2
    }).format(value);
  }
}
