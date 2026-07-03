<?php

namespace App\Controllers;

use App\Exceptions\AppException;
use App\Helpers\HttpHelper;
use App\Models\CategoryModel;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

/**
 * Contrôleur pour gérer les catégories.
 *
 * Ce contrôleur traite les requêtes HTTP liées aux catégories, en déléguant
 * la logique métier au modèle CategoryModel et en formatant les réponses.
 */
class CategoryController
{
    /**
     * @var CategoryModel Le modèle chargé de l'accès aux données des catégories.
     */
    private CategoryModel $model;

    /**
     * Constructeur de la classe.
     *
     * @param CategoryModel $model L'instance du modèle CategoryModel.
     */
    public function __construct(CategoryModel $model)
    {
        $this->model = $model;
    }

    /**
     * Récupère l'ensemble des catégories.
     *
     * @return Response La réponse HTTP modifiée contenant la liste des catégories au format JSON.
     *
     * @throws AppException Si une erreur survient lors de la récupération des catégories.
     */
    public function get(): Response
    {
        $categories = $this->model->get();
        return HttpHelper::jsonResponse(new Response(), $categories);
    }

    /**
     * Crée une nouvelle catégorie à partir des données envoyées en requête.
     *
     * @param Request $request La requête HTTP contenant les données de la catégorie.
     * @param Response $response La réponse HTTP initiale.
     *
     * @return Response La réponse HTTP modifiée (201) contenant la catégorie créée au format JSON.
     *
     * @throws AppException Si la catégorie parente est invalide ou si une erreur survient lors de la création.
     */
    public function create(Request $request, Response $response): Response
    {
        $payload = HttpHelper::getPayload($request);
        $this->model->create($payload);

        return $response
            ->withStatus(201);
    }

    /**
     * Met à jour une catégorie existante avec les données envoyées en requête.
     *
     * @param Request $request La requête HTTP contenant les données de mise à jour.
     * @param Response $response La réponse HTTP initiale.
     * @param array<string, mixed> $args Les arguments capturés par le routeur (doit contenir la clé 'id').
     *
     * @return Response La réponse HTTP modifiée contenant la catégorie mise à jour au format JSON.
     *
     * @throws AppException Si la catégorie n'existe pas ou si une erreur survient lors de la mise à jour.
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        $payload = HttpHelper::getPayload($request);
        $payload['id'] = HttpHelper::getIdOrNotFound($request, $args);

        $this->model->update($payload);
        return $response
            ->withStatus(204);
    }

    /**
     * Supprime une catégorie par son identifiant.
     *
     * @param Request $request La requête HTTP courante.
     * @param Response $response La réponse HTTP initiale.
     * @param array<string, mixed> $args Les arguments capturés par le routeur (doit contenir la clé 'id').
     *
     * @return Response La réponse HTTP modifiée avec le statut 200.
     *
     * @throws AppException Si la catégorie contient encore des fiches associées ou si une erreur survient.
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = HttpHelper::getIdOrNotFound($request, $args);
        $this->model->delete($id);

        return $response
            ->withStatus(200);
    }
}