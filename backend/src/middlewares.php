<?php

use Firebase\JWT\CachedKeySet;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;
use Slim\App;
use App\Middleware\ExceptionMiddleware;
use App\Middleware\TrailingSlashMiddleware;
use App\Middleware\AuthMiddleware;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

/**
 * Configuration des middlewares de l'application.
 *
 * Ce fichier définit tous les middlewares utilisés par l'API
 * – Middleware de routage pour gérer les routes définies.
 * - Middleware pour parser les corps de requêtes JSON.
 * - Middleware de gestion des exceptions personnalisées.
 * - Middleware pour uniformiser les URLs avec ou sans slash final.
 * - Middleware de gestion de l'authentification
 * - Middleware pour ajouter les en-têtes CORS nécessaires pour les requêtes cross-origin.
 * - Middleware d'erreur pour afficher les détails en mode développement.
 *
 * @param App $app L'instance Slim de l'application
 * @return void
 */
return function (App $app) {
    $dev_mode = $_ENV['DEV'] === "true";

    $app->addRoutingMiddleware();
    $app->addBodyParsingMiddleware();
    $app->add(new ExceptionMiddleware());
    $app->add(new TrailingSlashMiddleware());

    if (!$dev_mode) {
        $tenant_id = $_ENV['MSA_TENANT_ID'];

        $key_set = new CachedKeySet(
            "https://login.microsoftonline.com/{$tenant_id}/discovery/v2.0/keys",
            new Client(),
            new HttpFactory(),
            new FilesystemAdapter(),
            3600,
            true,
            'RS256'
        );

        $middleware = new AuthMiddleware(
            $key_set,
            $_ENV['MSA_CLIENT_ID'],
            "https://login.microsoftonline.com/{$tenant_id}/v2.0"
        );

        $app->add($middleware);
    }

    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);
        return $response
            ->withHeader('Access-Control-Allow-Origin', $_ENV['HOST'] ?? '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    });

    $app->addErrorMiddleware($dev_mode, true, true);
};