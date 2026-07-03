<?php

namespace App\Helpers;

use App\Controllers\UploadController;
use App\Exceptions\AppException;

class FicheHelper
{

    private const string TEMP_DIR = __DIR__ . '/../../public/uploads/temp/';
    private const string FINAL_DIR = __DIR__ . '/../../public/uploads/final/';

    /**
     * Transforme un article brut récupéré de la base de données en convertissant les champs JSON et les types de données appropriés.
     *
     * @param array<string, mixed> $article Un tableau associatif représentant un article tel qu'il est stocké en base de données, avec des champs encodés en JSON et des types de données bruts.
     *
     * @return array<string, mixed>|false Un tableau associatif représentant la fiche avec les champs JSON décodés et les types convertis, ou false si le tableau d'entrée est vide.
     */
    public static function parseFiche(array $article): array | false
    {
        if (!$article) {
            return false;
        }

        if (isset($article['id'])) {
            $article['id'] = (int)$article['id'];
        }
        if (isset($article['categories']) && is_string($article['categories'])) {
            $article['categories'] = json_decode($article['categories'], true);
        }
        if (isset($article['problem']) && is_string($article['problem'])) {
            $article['problem'] = json_decode($article['problem'], true);
        }
        if (isset($article['views'])) {
            $article['views'] = (int)$article['views'];
        }
        if (isset($article['archived'])) {
            $article['archived'] = (bool)$article['archived'];
        }
        if (isset($article['tags']) && is_string($article['tags'])) {
            $article['tags'] = json_decode($article['tags'], true);
        }
        if (isset($article['steps']) && is_string($article['steps'])) {
            $article['steps'] = json_decode($article['steps'], true);
        }
        if (isset($article['notes']) && is_string($article['notes'])) {
            $article['notes'] = json_decode($article['notes'], true);
        }
        if (isset($article['history']) && is_string($article['history'])) {
            $article['history'] = json_decode($article['history'], true);
        }

        return $article;
    }

    /**
     * Procède au traitement des images prévues dans les étapes d'une fiche à sa création, modification ou suppression.
     *
     * La fonction s'occupe de récupérer toutes les images présentes dans les étapes de la fiche actuelle.
     * S'ils existent des images fraîchement téléchargées, elles sont marquées comme confirmées et leur chemin d'accès final est modifié dans l'étape qui leur est associée.
     * Si l'argument optionnel $old_steps est présent, la fonction compare les deux versions et supprime les fichiers d'image obsolètes.
     *
     * @param array|null $steps
     * @param array|null $old_steps
     *
     * @return void
     *
     * @throws AppException
     */
    public static function processStepsImages(?array &$steps, ?array $old_steps = null): void
    {
        $upload_controller = new UploadController();

        $images = [];
        if (!empty($steps)) {
            array_walk_recursive($steps, function (&$value, $key) use ($upload_controller, &$current_images) {
                if ($key === 'image' && is_string($value)) {
                    if (str_starts_with($value, '/uploads/temp/')) $value = $upload_controller->confirmUpload($value);
                    $current_images[] = $value;
                }
            });
        }

        if (empty($old_steps)) return;

        $old_images = [];
        array_walk_recursive($old_steps, fn($v, $k) => ($k === 'image' && is_string($v)) ? $old_images[] = $v : null);

        foreach (array_diff($images, $old_images) as $image) {
            $url = realpath(str_starts_with($image, '/uploads/temp/') ? self::TEMP_DIR : self::FINAL_DIR . basename($image));
            if (file_exists($url)) unlink($url);
        }
    }

    /**
     * Construit une liste de changements entre deux versions d'un article en comparant les champs pertinents.
     *
     * @param array<string, mixed> $before Version antérieure de l'article
     * @param array<string, mixed> $after Version actuelle de l'article
     *
     * @return list<array{field: string, old_value: mixed, new_value: mixed}>|null Une liste de changements détectés entre les deux versions, ou null s'il n'y a aucune différence significative.
     */
    public static function buildChanges(array $before, array $after): ?array
    {
        $fields = [
            'title',
            'categories',
            'problem',
            'steps',
            'notes',
            'tags'
        ];

        $changes = [];
        foreach ($fields as $field) {
            switch ($field) {
                case 'title':
                    $before[$field] = trim($before[$field]);
                    $after[$field] = trim($after[$field]);
                    if ($before[$field] !== $after[$field])
                        $changes[] = [
                            'field' => $field,
                            'old_value' => $before[$field],
                            'new_value' => $after[$field]
                        ];
                    break;
                case 'problem':
                case 'notes':
                    if ($before[$field] != $after[$field]) {
                        $changes[] = [
                            'field' => $field,
                            'old_value' => $before[$field],
                            'new_value' => $after[$field]
                        ];
                    }
                    break;
                default:
                    if ($before[$field] !== $after[$field]) {
                        $changes[] = [
                            'field' => $field,
                            'old_value' => $before[$field],
                            'new_value' => $after[$field]
                        ];
                    }
                    break;
            }
        }

        return $changes;
    }
}