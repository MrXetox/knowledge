<?php

namespace App\Exceptions;

use Exception;
use Throwable;

/**
 * Exception personnalisée pour l'application.
 *
 * Hérite d'Exception native et fournit des valeurs par défaut
 * pour le code HTTP (500) et le message d'erreur générique.
 * Utilisée pour lever des erreurs métier avec gestion cohérente.
 */
class AppException extends Exception
{
    /**
     * @var int Le code d'erreur HTTP par défaut (erreur interne du serveur).
     */
    protected $code = 500;

    /**
     * @var string Le message d'erreur par défaut.
     */
    protected $message = "Une erreur technique interne est survenue.";

    public function __construct(string $message = "", int $code = 0, ?Throwable $previous = null)
    {
        error_log((string) $previous);
        parent::__construct($message, $code, $previous);
    }
}

