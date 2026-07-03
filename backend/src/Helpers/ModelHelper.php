<?php

namespace App\Helpers;

use App\Exceptions\AppException;
use Doctrine\DBAL\Connection;
use Slim\Psr7\Request;

class ModelHelper
{
    /**
     * Rollback à l'état précédent de la base de données si une transaction encore active a échoué.
     *
     * @param Connection $db Connexion active à la DB
     *
     * @throws AppException Si une erreur est survenue au moment du rollback
     */
    public static function rollback(Connection $db): void
    {
        if (!$db->isTransactionActive()) return;
        try {
            $db->rollBack();
        } catch (\Throwable $exception) {
            throw new AppException(previous: $exception);
        }
    }
}