<?php

namespace App\Models;

use App\Exceptions\AppException;
use App\Helpers\FicheHelper;
use Doctrine\DBAL\Connection;
use Throwable;

/**
 * Modèle pour récupérer les informations affichées sur la page d'accueil.
 *
 * Cette classe fournit des méthodes pour récupérer le nombre total de fiches, les dernières fiches créées et les fiches les plus consultées.
 */
class DashboardModel
{
    private Connection $db;

    /**
     * Constructeur de la classe.
     *
     * @param Connection $db La connexion à la base de données.
     */
    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    /**
     * Récupère le nombre total de fiches présentes dans la base de données.
     *
     * @return int Le nombre total de fiches.
     *
     * @throws AppException Si une erreur survient lors de la récupération du nombre de fiches depuis la base de données.
     */
    public function getFichesCount(): int
    {
        $sql = 'SELECT COUNT(id) FROM fiches';
        try {
            $count = $this->db->fetchOne($sql);
            if ($count === false) {
                throw new AppException("Échec lors de la récupération du nombre d'fiches.");
            }

            return (int) $count;
        } catch (Throwable $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Récupère les trois dernières fiches créées sous forme de cartes.
     *
     * @return array Un tableau de cartes (id, title, tags, source, views, categories, date) triées par identifiant décroissant, limitées à 3 résultats.
     *
     * @throws AppException Si une erreur survient lors de la récupération des fiches depuis la base de données.
     */
    public function getLatestCards(): array
    {
        $sql = 'SELECT f.id, f.title, f.tags, f.views, f.archived,
               (
                SELECT COALESCE(
                    json_agg(ac.category_id), \'[]\'::json
                )
                FROM fiche_category ac
                WHERE ac.fiche_id = f.id
            ) AS categories,
            (
                SELECT MAX(ah.date)
                FROM fiche_history ah
                WHERE ah.fiche_id = f.id
            ) AS last_modified
            FROM fiches f
            WHERE f.archived = false
            ORDER BY f.id DESC
            LIMIT 3';

        try {
            $query = $this->db->fetchAllAssociative($sql);
            return array_map(FicheHelper::parseFiche(...), $query);
        } catch (Throwable $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Récupère les trois fiches les plus consultées avec leurs catégories et leur date de dernière modification.
     *
     * @return array Un tableau de cartes (id, title, tags, source, views, categories, date) triées par nombre de vues décroissant, limitées à 3 résultats.
     *
     * @throws AppException Si une erreur survient lors de la récupération des fiches depuis la base de données.
     */
    public function getMostViewedCards(): array
    {
        $sql = 'SELECT f.id, f.title, f.tags, f.views, f.archived,
               (
                SELECT COALESCE(
                    json_agg(ac.category_id), \'[]\'::json
                )
                FROM fiche_category ac
                WHERE ac.fiche_id = f.id
            ) AS categories,
            (
                SELECT MAX(ah.date)
                FROM fiche_history ah
                WHERE ah.fiche_id = f.id
            ) AS last_modified
            FROM fiches f
            WHERE f.archived = false
            ORDER BY f.views DESC
            LIMIT 3';

        try {
            $query = $this->db->fetchAllAssociative($sql);
            return array_map(FicheHelper::parseFiche(...), $query);
        } catch (Throwable $e) {
            throw new AppException(previous: $e);
        }
    }
}