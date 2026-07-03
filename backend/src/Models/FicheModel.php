<?php

namespace App\Models;

use App\Exceptions\AppException;
use App\Helpers\FicheHelper;
use App\Helpers\ModelHelper;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Exception\DriverException;
use Throwable;

/**
 * Modèle pour gérer les fiches de la base de données.
 *
 * Cette classe fournit des méthodes pour créer, consulter, modifier, supprimer et archiver les fiches.
 * Elle gère également le suivi de l'historique des modifications pour chaque fiche.
 */
class FicheModel
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
     * Récupère une liste de fiches filtrées par mot-clé, catégorie et statut d'archivage, avec les catégories associées et la date de dernière modification.
     *
     * @param string $query Le mot-clé de recherche à appliquer sur le titre, le problème et les tags (recherche insensible à la casse).
     * @param int $category L'identifiant de la catégorie pour filtrer les fiches (0 pour inclure toutes les catégories).
     * @param bool $archived Indique si les fiches archivées doivent être incluses dans les résultats (false pour exclure, true pour inclure).
     *
     * @return array Un tableau de carte (id, title, tags, views, categories, date) correspondant aux fiches filtrées selon les critères spécifiés.
     *
     * @throws AppException Si une erreur survient lors de la récupération des fiches depuis la base de données.
     */
    public function search(string $query, int $category, bool $archived, ?int $offset = 0): array
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
                ) AS last_modified,
                ts_rank(f.search_vector, websearch_to_tsquery(\'french\', :query)) AS rang
                FROM fiches f
                WHERE (f.search_vector @@ websearch_to_tsquery(\'french\', :query) OR f.tags::text ILIKE \'%\' || :query || \'%\')
                    AND f.archived = :archived
                    AND (
                        :category = 0
                        OR EXISTS (
                            SELECT 1 
                            FROM fiche_category ac_filter
                            JOIN categories c_filter ON ac_filter.category_id = c_filter.id
                            WHERE ac_filter.fiche_id = f.id
                            AND (c_filter.id = :category OR c_filter.parent_id = :category)
                        )
                    )
                ORDER BY rang DESC, f.id DESC
                LIMIT 30 OFFSET :offset';


        error_log($offset);
        try {
            $query = $this->db->fetchAllAssociative($sql, [
                'query' => '%' . $query . '%',
                'category' => $category,
                'archived' => $archived ? 1 : 0,
                'offset' => $offset
            ]);

            return array_map(FicheHelper::parseFiche(...), $query);
        } catch (Throwable $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Récupère une fiche complète avec ses catégories et son historique, et incrémente le compteur de vues.
     *
     * @param int $id L'identifiant de la fiche à récupérer.
     *
     * @return array|false Un tableau associatif contenant les détails de la fiche, ou false si la fiche n'existe pas.
     *
     * @throws AppException Si une erreur survient lors de la récupération de la fiche ou de la mise à jour du compteur de vues.
     */
    public function get(int $id, bool $invisible = false): array | false
    {
        $sql = 'SELECT f.*,
               (
                SELECT COALESCE(
                    json_agg(ac.category_id), \'[]\'::json
                )
                FROM fiche_category ac
                WHERE ac.fiche_id = f.id
            ) AS categories,
            (
                SELECT COALESCE(
                    json_agg(
                        json_build_object(
                            \'id\', ah.id,
                            \'date\', ah.date,
                            \'author\', ah.author,
                            \'type\', ah.type,
                            \'summary\', ah.summary,
                            \'changes\', ah.changes
                        ) ORDER BY ah.date DESC
                    ), \'[]\'::json
                )
                FROM fiche_history ah
                WHERE ah.fiche_id = f.id
            ) AS history
            FROM fiches f 
            WHERE f.id = :id';

        try {
            $query = $this->db->fetchAssociative($sql, ['id' => $id]);

            if ($query === false) return false;

            if (!$invisible) {
                $this->db->executeStatement('UPDATE fiches SET views = views + 1 WHERE id = :id', ['id' => $id]);
                $query['views'] += 1;
            }

            return FicheHelper::parseFiche($query);
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Crée une nouvelle fiche avec les informations fournies et ajoute un historique de création.
     *
     * @param array $payload Les données de la fiche à créer (title, problem, notes, tags, steps, categories).
     * @param string $author L'auteur de la création
     *
     * @return int Un tableau associatif contenant l'fiche créé avec tous ses détails.
     *
     * @throws AppException Si une erreur survient lors de la création (catégorie invalide, erreur base de données, etc.).
     */
    public function create(array $payload, string $author): int
    {
        $fiche = [
            'title'       => $payload['title'],
            'problem'     => json_encode($payload['problem']),
            'views'       => 0,
            'notes'       => json_encode($payload['notes']),
            'archived'    => 0,
            'tags'        => json_encode($payload['tags']),
            'steps'       => json_encode($payload['steps']),
        ];

        try {
            $this->db->beginTransaction();

            $this->db->insert('fiches', $fiche);
            $id = (int) $this->db->lastInsertId();

            $this->history($id, 'creation', 'Fiche créée', $author);

            foreach ($payload['categories'] as $category) {
                $this->db->insert('fiche_category', [
                    'fiche_id' => $id,
                    'category_id' => $category,
                ]);
            }

            $this->db->commit();
            return $id;
        } catch (DriverException $e) {
            ModelHelper::rollback($this->db);

            if ($e->getSQLState() === '23503')
                throw new AppException("La catégorie associée est invalide ou inexistante.", 400, $e);

            throw new AppException(previous: $e);
        } catch (Exception $e) {
            ModelHelper::rollback($this->db);
            throw new AppException(previous: $e);
        }
    }

    /**
     * Met à jour une fiche existante avec les nouvelles informations et enregistre les changements dans l'historique.
     *
     * @param int $id L'identifiant de la fiche à mettre à jour.
     * @param array $payload Les nouvelles données de la fiche (title, problem, notes, tags, steps, categories).
     * @param string $author L'auteur de la modification.
     *
     * @return array Un tableau associatif contenant l'fiche mis à jour avec tous ses détails.
     *
     * @throws AppException Si la fiche est introuvable ou si une erreur survient lors de la mise à jour.
     */
    public function update(int $id, array $payload, string $author): array
    {
        try {
            $sql = 'SELECT f.*,
            (
                SELECT COALESCE(
                    json_agg(ac.category_id), \'[]\'::json
                )
                FROM fiche_category ac
                WHERE ac.fiche_id = f.id
            ) AS categories
            FROM fiches f 
            WHERE f.id = :id';

            $raw_fiche = $this->db->fetchAssociative($sql, ['id' => $id]);

            if ($raw_fiche === false)
                throw new AppException('Fiche introuvable.', 404);

            $current_fiche = FicheHelper::parseFiche($raw_fiche);

            if ($current_fiche['archived'] === true
                && (!array_key_exists('archived', $payload)
                || !array_key_exists('categories', $payload)))
                throw new AppException('API Violation', 500);

            $this->db->beginTransaction();

            if (array_key_exists('archived', $payload)) {
                $archived = $payload['archived'] ? 1 : 0;
                $this->db->update('fiches', ['archived' => $archived], ['id' => $id]);
                $this->db->delete('fiche_category', ['fiche_id' => $id]);

                $this->history(
                    $id,
                    $archived ? 'archive' : 'unarchive',
                    $archived ? 'Fiche archivée' : 'Fiche désarchivée',
                    $author
                );
            } else {
                $filtered_payload = array_filter($payload, fn($v) => $v !== null);

                if (!empty($filtered_payload)) {
                    $updated_fiche = array_merge($current_fiche, $filtered_payload);
                    $changes = FicheHelper::buildChanges($current_fiche, $updated_fiche);

                    if (!empty($changes)) {
                        $fiche = [
                            'title'    => $updated_fiche['title'],
                            'problem'  => json_encode($updated_fiche['problem']),
                            'notes'    => json_encode($updated_fiche['notes']),
                            'steps'    => json_encode($updated_fiche['steps']),
                            'tags'     => json_encode($updated_fiche['tags'])
                        ];

                        $this->db->update('fiches', $fiche, ['id' => $id]);
                        $this->history($id, 'edit', 'Fiche modifiée', $author, $changes);
                    }
                }
            }

            if (isset($payload['categories']) && is_array($payload['categories'])) {
                $this->db->delete('fiche_category', ['fiche_id' => $id]);
                foreach ($payload['categories'] as $category) {
                    $this->db->insert('fiche_category', [
                        'fiche_id'  => $id,
                        'category_id' => $category,
                    ]);
                }
            }

            $this->db->commit();
            return $this->get($id, true);
        } catch (Exception $e) {
            ModelHelper::rollback($this->db);
            throw new AppException(previous: $e);
        }
    }

    /**
     * Supprime une fiche de la base de données.
     *
     * @param int $id L'identifiant de la fiche à supprimer.
     *
     * @return void
     *
     * @throws AppException Si une erreur survient lors de la suppression.
     */
    public function delete(int $id): void
    {
        try {
            $this->db->delete('fiches', ['id' => $id]);
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Enregistre una nouvelle entrée dans l'historique d'une fiche.
     *
     * @param int $fiche_id L'identifiant de la fiche concernée.
     * @param string $type Le type d'action (creation, edit, archive, unarchive).
     * @param string $summary Un résumé de l'action effectuée.
     * @param string $author L'auteur de l'action.
     * @param array|null $changes Un tableau optionnel des changements effectués (pour les éditions).
     *
     * @return void
     *
     * @throws AppException Si une erreur survient lors de l'insertion dans l'historique.
     */
    private function history(int $fiche_id, string $type, string $summary, string $author, ?array $changes = null): void
    {
        try {
            $this->db->insert('fiche_history', [
                'fiche_id' => $fiche_id,
                'author' => $author,
                'type' => $type,
                'summary' => $summary,
                'changes' => $changes === null ? null : json_encode($changes),
            ]);
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }
}