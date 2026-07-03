<?php

use App\Controllers\CategoryController;
use App\Controllers\DashboardController;
use App\Controllers\FichesController;
use App\Controllers\UploadController;
use App\Middleware\ValidationMiddleware;
use App\Validation\Schemas;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

/**
 * Configuration des routes de l'application.
 *
 * Ce fichier définit toutes les routes HTTP disponibles pour l'API
 * – Redirection vers le site principal
 * - Routes API pour fiches, catégories et uploads
 * - Middleware de validation appliqué aux routes appropriées.
 *
 * @param App $app L'instance Slim de l'application
 * @return void
 */

return function(App $app) {

    /**
     * Route pour les requêtes OPTIONS (CORS preflight).
     *
     * OPTIONS /{routes:.*} → Répond avec 200 OK pour toutes les routes.
     * Permet de gérer les requêtes préliminaires CORS pour les navigateurs.
     */
    $app->options('/{routes:.*}', function ($request, $response) {
        return $response;
    });

    /**
     * Requête du dashboard
     *
     * GET /dashboard/stats → Récupère les informations de la page d'accueil
     */
    $app->get('/dashboard/stats', [DashboardController::class, 'stats']);

    /**
     * Groupe des routes uploads : /uploads
     *
     * POST /upload - Télécharge une image (validée).
     */
    $app->post('/upload', [UploadController::class, 'upload'])
        ->addMiddleware(new ValidationMiddleware(Schemas::image()));

    /**
     * Groupe des routes catégories : /categories
     *
     * GET /categories - Liste toutes les catégories
     * POST /categories - Crée une nouvelle catégorie
     * PATCH /categories/{id} - Met à jour une catégorie
     * DELETE /categories/{id} - Supprime une catégorie
     */
    $app->group('/categories', function (RouteCollectorProxy $group) {
        $group->get('', [CategoryController::class, 'get']);
        $group->post('', [CategoryController::class, 'create'])
            ->addMiddleware(new ValidationMiddleware(Schemas::category(false)));
        $group->patch('/{id:[0-9]+}', [CategoryController::class, 'update'])
            ->addMiddleware(new ValidationMiddleware(Schemas::category(true)));
        $group->delete('/{id:[0-9]+}', [CategoryController::class, 'delete']);
    });

    /**
     * Groupe des routes fiches : /fiches
     *
     * GET /fiches - Recherche les fiches avec un filtre (search, category, archived)
     * GET /fiches/{id} - Récupère une fiche spécifique
     * POST /fiches - Crée une nouvelle fiche
     * PATCH /fiches/{id} - Met à jour une fiche
     * DELETE /fiches/{id} - Supprime une fiche
     */
    $app->group('/fiches', function (RouteCollectorProxy $group) {
        $group->get('', [FichesController::class, 'search']);
        $group->get('/{id:[0-9]+}', [FichesController::class, 'get']);
        $group->post('', [FichesController::class, 'create'])
            ->addMiddleware(new ValidationMiddleware(Schemas::fiche(false)));
        $group->patch('/{id:[0-9]+}', [FichesController::class, 'update'])
            ->addMiddleware(new ValidationMiddleware(Schemas::fiche(true)));
        $group->delete('/{id:[0-9]+}', [FichesController::class, 'delete']);
    });
};
