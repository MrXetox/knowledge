import { CategoryBranch, CategoryLeaf } from '../models/categories.model';

/**
 * Payload de base d'une catégorie
 */
export interface CategoryPayload {
  name: string;
  special: CategoryBranch['special'] | CategoryLeaf['special'];
  parent_id?: number;
}

/**
 * Payload pour la création (POST)
 * Tous les champs de la base sont requis (sauf parent_id).
 */
export type CreateCategoryPayload = CategoryPayload;

/**
 * Payload pour l'édition (PATCH)
 * On ajoute l'attribut spécifique à l'édition.
 */
export interface UpdateCategoryPayload extends Partial<CategoryPayload> {
  position?: number;
}
