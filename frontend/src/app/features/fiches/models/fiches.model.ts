import { JSONContent } from '@tiptap/core';

/**
 * Représentation d'une fiche
 * Contient toutes les informations relatives à une fiche
 */
export interface Fiche {
  id: number;
  title: string;
  categories: number[];
  tags: string[];
  views: number;
  problem: JSONContent;
  steps: FicheStep[];
  notes: JSONContent;
  history: FicheHistory[];
  archived: boolean;
}

/**
 * Représentation d'une étape contenue à l'intérieur d'une fiche
 * Peut contenir des sous-étapes
 */
export interface FicheStep {
  text: string;
  image?: string;
  substeps?: FicheStep[];
}

/**
 * Représentation d'un bloc d'historique d'une fiche
 * Enregistre les modifications à la fiche
 */
export interface FicheHistory {
  id: number;
  date: Date;
  author: string;
  type: 'creation' | 'edit' | 'archive' | 'unarchive';
  summary: string;
  changes?: FicheFieldChange[];
}

/**
 * Description des changements appliqués à un champ d'une fiche
 * Utilise un discriminated union pour typer les anciennes et nouvelles valeurs
 */
export type FicheFieldChange =
  {
    field: 'title';
    old_value: string | null;
    new_value: string | null;
  } |
  {
    field: 'problem' | 'notes';
    old_value: JSONContent | null;
    new_value: JSONContent | null;
  } | {
    field: 'tags';
    old_value: string[] | null;
    new_value: string[] | null;
  } | {
    field: 'categories';
    old_value: number[] | null;
    new_value: number[] | null;
  } | {
    field: 'steps';
    old_value: FicheStep[] | null;
    new_value: FicheStep[] | null;
  } | {
    field: 'files';
    old_value: string[] | null;
    new_value: string[] | null;
  };

/**
 * Représentation d'une fiche allegé sous forme de carte
 * Contient des informations réduites d'une fiche (titre, categories, tags, views et date de la dernière modification)
 */
export interface Card extends Omit<Fiche, 'problem' | 'steps' | 'notes' | 'files' | 'history'> {
  last_modified: Date;
}

