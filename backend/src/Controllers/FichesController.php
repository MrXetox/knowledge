<?php

namespace App\Controllers;

use App\Exceptions\AppException;
use App\Helpers\FicheHelper;
use App\Helpers\HttpHelper;
use App\Models\FicheModel;

use Slim\Psr7\Request;
use Slim\Psr7\Response;

/**
 * Contrôleur pour gérer les fiches (fiches).
 *
 * Ce contrôleur traite les requêtes HTTP liées aux fiches, en déléguant
 * la logique métier au modèle FicheModel et en formatant les réponses.
 */
class FichesController
{
    /**
     * @var FicheModel Le modèle chargé de l'accès aux données des fiches.
     */
    private FicheModel $model;

    /**
     * Constructeur de la classe.
     *
     * @param FicheModel $model L'instance du modèle injectée en dépendance.
     */
    public function __construct(FicheModel $model)
    {
        $this->model = $model;
    }

    /**
     * Récupère une liste de cartes filtrée selon les paramètres de la requête.
     *
     * Paramètres d'URL pris en charge :
     * - 'search' : Terme de recherche (chaîne de caractères, vide par défaut).
     * - 'category' : Identifiant de la catégorie (number ou null).
     * - 'archived' : Indicateur d'archivage (boolean ou null).
     *
     * @param Request $request La requête HTTP contenant les paramètres d'URL.
     * @param Response $response La réponse HTTP initiale.
     *
     * @return Response La réponse HTTP modifiée contenant la liste des cartes au format JSON.
     *
     * @throws AppException Si la récupération des cartes échoue ou si les paramètres sont invalides.
     */
    public function search(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();

        $search = $params['search'] ?? '';
        $category = (int) ($params['category'] ?? 0);
        $archived = $params['archived'] ?? 'false' === 'true';

        $offset = (int) ($params['offset'] ?? null);

        $fiches = $this->model->search($search, $category, $archived, $offset);
        return HttpHelper::jsonResponse($response, $fiches);
    }

    /**
     * Récupère les détails d'une fiche spécifique par son identifiant.
     *
     * @param Request $request La requête HTTP courante.
     * @param Response $response La réponse HTTP initiale.
     * @param array<string, mixed> $args Les arguments capturés par le routeur (doit contenir la clé 'id').
     *
     * @return Response La réponse HTTP modifiée contenant l'fiche au format JSON.
     *
     * @throws AppException Si l'fiche demandé n'existe pas en base de données.
     */
    public function get(Request $request, Response $response, array $args): Response
    {
        $id = HttpHelper::getIdOrNotFound($request, $args);

        $fiche = $this->model->get($id);
        if ($fiche === false) {
            throw new AppException('fiche introuvable', 404);
        }

        return HttpHelper::jsonResponse($response, $fiche);
    }

    /**
     * Crée une nouvelle fiche à partir des données envoyées en requête.
     *
     * Traite également les images des étapes et récupère l'auteur de la requête.
     *
     * @param Request $request La requête HTTP contenant les données de la fiche.
     * @param Response $response La réponse HTTP initiale.
     *
     * @return Response La réponse HTTP modifiée (201) contenant la fiche créée au format JSON.
     *
     * @throws AppException Si une erreur survient lors de la création ou du traitement des images.
     */
    public function create(Request $request, Response $response): Response
    {
        $author = HttpHelper::getUserName($request);
        $payload = HttpHelper::getPayload($request);

        FicheHelper::processStepsImages($payload['steps']);

        $id = $this->model->create($payload, $author);

        return HttpHelper::jsonResponse($response, ['id' => $id], 201);
    }

    /**
     * Met à jour une fiche existante avec les données envoyées en requête.
     *
     * Traite également les images des étapes en comparant les anciennes et nouvelles versions.
     *
     * @param Request $request La requête HTTP contenant les données de mise à jour.
     * @param Response $response La réponse HTTP initiale.
     * @param array<string, mixed> $args Les arguments capturés par le routeur (doit contenir la clé 'id').
     *
     * @return Response La réponse HTTP modifiée contenant la fiche mise à jour au format JSON.
     *
     * @throws AppException Si la fiche n'existe pas ou si une erreur survient lors de la mise à jour.
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        $id = HttpHelper::getIdOrNotFound($request, $args);
        $payload = HttpHelper::getPayload($request);

        $current_fiche = $this->model->get($id, true);
        $old_steps = $current_fiche !== false ? $current_fiche['steps'] : null;

        FicheHelper::processStepsImages($payload['steps'], $old_steps);

        $author = HttpHelper::getUserName($request);
        $fiche = $this->model->update($id, $payload, $author);

        return HttpHelper::jsonResponse($response, $fiche);
    }

    /**
     * Supprime une fiche par son identifiant.
     *
     * @param Request $request La requête HTTP courante.
     * @param Response $response La réponse HTTP initiale.
     * @param array<string, mixed> $args Les arguments capturés par le routeur (doit contenir la clé 'id').
     *
     * @return Response La réponse HTTP modifiée avec le statut 200.
     *
     * @throws AppException Si la fiche n'existe pas ou si une erreur survient lors de la suppression.
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = HttpHelper::getIdOrNotFound($request, $args);

        $current_fiche = $this->model->get($id, true);
        if ($current_fiche['archived'] === false)
            throw new AppException('La fiche n\'est pas archivée', 422);

        $old_steps = $current_fiche !== false ? $current_fiche['steps'] : null;

        $steps = null;
        FicheHelper::processStepsImages($steps, $old_steps);
        $this->model->delete($id);

        return $response->withStatus(200);
    }
}