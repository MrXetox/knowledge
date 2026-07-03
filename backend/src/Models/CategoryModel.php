<?php

namespace App\Models;

use App\Exceptions\AppException;
use App\Helpers\ModelHelper;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Exception\DriverException;

/**
 * Modèle pour gérer les catégories en base de données.
 *
 * Cette classe permet de lister, récupérer, créer, modifier et supprimer des catégories,
 * avec gestion des erreurs métier via AppException.
 */
class CategoryModel
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
     * Récupère l'ensemble des catégories avec le nombre de fiches associées pour les sous-catégories.
     *
     * @return array Un tableau de catégories (id, name, special, parent_id, fiches_count).
     *
     * @throws AppException Si une erreur survient lors de la récupération des catégories.
     */
    public function get(): array
    {
        $sql = 'SELECT 
            c.id,
            c.name,
            c.special,
            c.position,
            c.parent_id,
            CASE WHEN c.parent_id IS NOT NULL THEN
                COUNT(ac.fiche_id)
            END AS fiches_count
        FROM categories c
        LEFT JOIN fiche_category ac ON c.id = ac.category_id
        GROUP BY 
            c.id,
            c.parent_id,
            c.position
        ORDER BY 
            c.parent_id NULLS FIRST,
            c.position';

        try {
            return $this->db->fetchAllAssociative($sql);
        } catch (Exception $e) {
            throw new AppException(
                'Échec de la récupération des catégories',
                previous: $e
            );
        }
    }

    /**
     * Crée une nouvelle catégorie puis retourne la catégorie créée.
     *
     * @param array $payload Les données de la catégorie à créer (name, special, parent_id optionnel).
     *
     * @return void
     *
     * @throws AppException Si la catégorie parente est invalide ou si la création échoue.
     */
    public function create(array $payload): void
    {
        $category = [
            'name' => $payload['name'],
            'special' => $payload['special'],
            'parent_id' => $payload['parent_id'] ?? null
        ];

        try {
            $last = $this->getLastPosition($payload['parent_id'] ?? null);
            $category['position'] = $last + 1;

            $this->db->insert('categories', $category);
        } catch (DriverException $e) {
            throw match ($e->getSQLState()) {
                '23503' => new AppException('La catégorie parente spécifiée est invalide.', previous: $e),
                default => new AppException('Échec de la création de la catégorie.', previous: $e),
            };
        } catch (Exception $e) {
            throw new AppException(
                'Échec lors de la création de la catégorie',
                previous: $e
            );
        }
    }

    /**
     * Met à jour une catégorie existante puis retourne la catégorie mise à jour.
     *
     * @param array $payload Les données de mise à jour (id, name, special).
     *
     * @return void
     *
     * @throws AppException Si une erreur survient lors de la mise à jour.
     */
    public function update(array $payload): void
    {
        try {
            if (isset($payload['position'])) {
                $this->move($payload['id'], $payload['position'], $payload['parent_id'] ?? null);
            }
            if (isset($payload['name']) && isset($payload['special'])) {
                $this->db->update('categories', [
                    'name' => $payload['name'],
                    'special' => $payload['special'],
                ], ['id' => $payload['id']]);
            }
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Supprime une catégorie par son identifiant.
     *
     * @param int $id L'identifiant de la catégorie à supprimer.
     *
     * @return void
     *
     * @throws AppException Si la catégorie est encore référencée ou si la suppression échoue.
     */
    public function delete(int $id): void
    {
        $category = $this->getById($id);

        if (!$category) {
            throw new AppException('Catégorie introuvable', 404);
        }

        try {
            $this->shiftOut($category['parent_id'], $category['position']);
            $this->db->delete('categories', ['id' => $id]);
        } catch (DriverException $e) {
            $state = $e->getSQLState();

            if (in_array($state, ['23001', '23503'], true)) {
                throw new AppException(
                    'Impossible de supprimer cette catégorie car elle contient encore des fiches',
                    409,
                    $e
                );
            }

            throw new AppException(previous: $e);
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Récupère une catégorie par son identifiant avec son nombre de fiches associées.
     *
     * @param int $id L'identifiant de la catégorie à récupérer.
     *
     * @return array Un tableau associatif représentant la catégorie, ou un tableau vide si elle n'existe pas.
     *
     * @throws AppException Si une erreur survient lors de la récupération de la catégorie.
     */
    private function getById(int $id): array
    {
        $sql = 'SELECT 
            c.id,
            c.name,
            c.special,
            c.parent_id,
            c.position,
            CASE WHEN c.parent_id IS NOT NULL THEN
                COUNT(ac.fiche_id)
            END AS fiches_count
        FROM categories c
        LEFT JOIN fiche_category ac ON c.id = ac.category_id
        WHERE c.id = :id
        GROUP BY 
            c.id, 
            c.name, 
            c.parent_id
        ORDER BY 
            c.id,
            c.parent_id NULLS FIRST, 
            c.name;';

        try {
            $query = $this->db->fetchAssociative($sql, ['id' => $id]);
            return $query === false ? [] : $query;
        } catch (Exception $e) {
            throw new AppException(
                'Échec lors de la récupération de la catégorie',
                previous: $e
            );
        }
    }

    /**
     * Récupère la dernière position dans un arbre
     *
     * @param int|null $parent_id ID du parent
     *
     * @return int La dernière position
     *
     * @throws Exception Si une erreur survient lors de la récupération du
     */
    private function getLastPosition(?int $parent_id): int
    {
        [$condition, $params] = $this->parentCondition($parent_id);
        return (int) $this->db->fetchOne(
            "SELECT COALESCE(MAX(position), 0) FROM categories WHERE $condition",
            $params
        );
    }

    /**
     * Déplace une catégorie en mettant à jour
     * les positions des catégories affectées et en changeant, si nécessaire, le parent.
     *
     * Scénarios traités :
     * - Déplacement dans le même parent : décale les positions entre l'ancienne et la nouvelle position.
     * - Changement de parent : réindexe les positions dans l'ancien parent (décalage vers le haut)
     *   puis insère la catégorie dans le nouveau parent en décalant les positions >= nouvelle position.
     *
     * La fonction effectue ses opérations dans une transaction. En cas d'erreur liée à la contrainte
     * de clé étrangère (catégorie parente inexistante), une AppException est levée avec le détail du
     * DriverException sous-jacent.
     *
     * @param int $id Identifiant de la catégorie à déplacer.
     * @param int $new_position : nouvelle position, >= 0
     * @param int|null $new_parent: identifiant du nouveau parent, ou null pour racine.
     *
     * @return void
     *
     * @throws AppException En cas d'erreur lors des opérations en base (contrainte FK, erreur SQL, etc.).
     */
    private function move(int $id, int $new_position, ?int $new_parent = null): void
    {
        $current_category = $this->getById($id);
        if (!$current_category)
            throw new AppException('Catégorie introuvable.');

        $old_parent = $current_category['parent_id'];
        $old_position = $current_category['position'];

        if ($old_parent === null && $new_parent !== null)
            throw new AppException('Une catégorie principale ne peut pas devenir une sous-catégorie.');

        if ($old_parent !== null && $new_parent === null)
            throw new AppException('Une sous-catégorie ne peut pas devenir une catégorie principale.');

        if ($old_position === $new_position && $old_parent === $new_parent) return;

        try {
            $this->db->beginTransaction();

            if ($old_parent === $new_parent) {
                $this->shiftPositions($old_parent, $old_position, $new_position);
            } else {
                $this->shiftOut($old_parent, $old_position);
                $this->shiftIn($new_parent, $new_position);
            }

            $this->db->update('categories', [
                'position' => $new_position,
                'parent_id' => $new_parent,
            ], ['id' => $id]);

            $this->db->commit();
        } catch (DriverException $e) {
            ModelHelper::rollback($this->db);
            throw match ($e->getSQLState()) {
                '23503'  => new AppException('La catégorie parente n\'existe pas', previous: $e),
                default  => new AppException(previous: $e),
            };
        } catch (Exception $e) {
            throw new AppException(previous: $e);
        }
    }

    /**
     * Permet de différencier les déplacements de catégories ou sous-catégories
     *
     * @param int|null $parent_id Parent de la sous-catégorie.
     *
     * @return array
     */
    private function parentCondition(?int $parent_id): array
    {
        return $parent_id === null
            ? ['parent_id IS NULL', []]
            : ['parent_id = :parent_id', ['parent_id' => $parent_id]];
    }

    /**
     * Change l'emplacement d'une catégorie et réorganise l'arbre en conséquence.
     *
     * @param int|null $parent_id ID du parent
     * @param int $old_position Ancienne position
     * @param int $new_position Nouvelle position
     *
     * @return void
     *
     * @throws Exception
     */
    private function shiftPositions(?int $parent_id, int $old_position, int $new_position): void
    {
        [$condition, $params] = $this->parentCondition($parent_id);

        if ($old_position < $new_position) {
            $sql = "UPDATE categories
               SET position = position - 1
               WHERE $condition
               AND position > :old_position
               AND position <= :new_position";
        } else {
            $sql = "UPDATE categories
                SET position = position + 1
                WHERE $condition
                AND position >= :new_position
                AND position < :old_position";
        }

        $this->db->executeStatement($sql, $params + ['old_position' => $old_position, 'new_position' => $new_position]);
    }

    /**
     * Réorganise l'arbre d'organisation quand on retire une catégorie
     *
     * @param int|null $parent_id ID du parent
     * @param int $position Position de la sous-catégorie retirée
     *
     * @return void
     *
     * @throws Exception
     */
    private function shiftOut(?int $parent_id, int $position): void
    {
        [$condition, $params] = $this->parentCondition($parent_id);
        $this->db->executeStatement(
            "UPDATE categories SET position = position - 1 WHERE $condition AND position > :position",
            $params + ['position' => $position]
        );
    }

    /**
     * Réorganise l'arbre d'organisation quand on ajoute une sous-catégorie
     *
     * @param int $parent ID du parent
     * @param int $position Position de la sous-catégorie ajoutée
     *
     * @return void
     *
     * @throws Exception
     */
    private function shiftIn(int $parent, int $position): void
    {
        [$condition, $params] = $this->parentCondition($parent);
        $this->db->executeStatement(
            "UPDATE categories SET position = position + 1 WHERE $condition AND position >= :position",
            $params + ['position' => $position]
        );
    }
}
