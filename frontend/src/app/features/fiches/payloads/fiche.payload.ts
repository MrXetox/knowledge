import { Fiche } from '../models/fiches.model';

/**
 * Payload envoyé lors de la création ou modification d'une fiche
 * Omis : id, source, views et history
 */
export type FichePayload = Omit<Fiche, 'id' | 'source' | 'views' | 'history'>;

/**
 * Structure pour l'export ou import d'une fiche en archive ZIP
 */
export type FicheExport = Omit<FichePayload, 'categories' | 'archived'>
