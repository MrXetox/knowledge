<?php

namespace App\Validation;

use Respect\Validation\ValidatorBuilder as v;
use Respect\Validation\Validator;

/**
 * Schémas de validation pour les requêtes de l'application.
 *
 * Fournit des schémas de validation réutilisables pour valider
 * les corps de requête (fiches, catégories, uploads) avec Respect\Validation.
 */
class Schemas
{
    /**
     * Schéma de validation pour une catégorie.
     *
     * Valide les champs :
     * - name : chaîne non vide (obligatoire).
     * - Special : chaîne non vide (obligatoire).
     * - Parent_id : entier positif (optionnel, pour les sous-catégories).
     *
     * @return Validator Le schéma de validation pour une catégorie.
     */
    public static function category(bool $update): Validator
    {
        if ($update)
            return v::keySet(
                v::keyOptional('name', v::stringType()->notBlank()),
                v::keyOptional('special', v::stringType()->notBlank()),
                v::keyOptional('parent_id', v::intType()->not(v::negative())),
                v::keyOptional('position', v::intType()->not(v::negative())),
            );

        return v::keySet(
            v::key('name', v::stringType()->notBlank()),
            v::key('special', v::stringType()->notBlank()),
            v::keyOptional('parent_id', v::intType()->not(v::negative())),
        );
    }

    /**
     * Schéma de validation pour une fiche complète.
     *
     * Valide les champs :
     * - title : chaîne non vide, min 5 caractères.
     * - problem : chaîne non vide, min 10 caractères.
     * - categories : tableau non vide contenant au moins 1 entier positif.
     * - tags : tableau non vide de min 3 chaînes non vides.
     * - notes : chaîne (peut être vide).
     * - steps : tableau non vide d'étapes, chacune avec "text" obligatoire et "substeps" optionnel.
     *
     * @return Validator Le schéma de validation pour une fiche.
     */
    public static function fiche(bool $update): Validator
    {
        if ($update)
            return v::keySet(
                v::keyOptional('title', v::stringType()->notBlank()->length(v::GreaterThanOrEqual(5))),
                v::keyOptional('problem', v::arrayType()),
                v::keyOptional('categories', v::arrayType()
                    ->length(v::GreaterThanOrEqual(1))
                    ->each(v::intType()->positive())
                ),
                v::keyOptional('tags', v::arrayType()
                    ->length(v::GreaterThanOrEqual(3))
                    ->each(v::stringType()->notBlank())
                ),
                v::keyOptional('notes', v::arrayType()),
                v::keyOptional('steps', v::arrayType()
                    ->each(
                        v::key('text', v::stringType()->notBlank())
                            ->keyOptional('substeps', v::arrayType()
                                ->each(v::key('text', v::stringType()->notBlank()))
                            )
                    )
                ),
                v::keyOptional('archived', v::boolType())
            );

        return v::keySet(
            v::key('title', v::stringType()->notBlank()->length(v::GreaterThanOrEqual(5))),
            v::key('problem', v::arrayType()),
            v::key('categories', v::arrayType()
                ->length(v::GreaterThanOrEqual(1))
                ->each(v::intType()->positive())
            ),
            v::key('tags', v::arrayType()
                ->length(v::GreaterThanOrEqual(3))
                ->each(v::stringType()->notBlank())
            ),
            v::key('notes', v::arrayType()),
            v::key('steps', v::arrayType()
                ->each(
                    v::key('text', v::stringType()->notBlank())
                        ->keyOptional('substeps', v::arrayType()
                            ->each(v::key('text', v::stringType()->notBlank()))
                        )
                )
            )
        );
    }

    /**
     * Schéma de validation pour l'upload d'une image.
     *
     * Valide le champ :
     * - file : doit être une instance de UploadedFileInterface (PSR-7)
     *
     * @return Validator Le schéma de validation pour un upload d'image.
     */
    public static function image(): Validator
    {
        return v::keySet(
            v::key('file', v::instance('\Psr\Http\Message\UploadedFileInterface'))
        );
    }
}