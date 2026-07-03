<?php
namespace App\Controllers;

use App\Exceptions\AppException;
use App\Helpers\HttpHelper;
use App\Models\DashboardModel;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

class DashboardController {

    /**
     * @var DashboardModel Le modèle chargé de l'accès aux données des fiches.
     */
    private DashboardModel $model;

    /**
     * Constructeur de la classe.
     *
     * @param DashboardModel $model L'instance du modèle FicheModel.
     */
    public function __construct(DashboardModel $model) {
        $this->model = $model;
    }

    /**
     * Récupère les données d'accueil : nombre total de fiches, dernières et plus consultées.
     *
     * @return Response La réponse HTTP modifiée contenant un objet avec fiches_count, latest et most_viewed.
     *
     * @throws AppException Si une erreur survient lors de la récupération des données.
     */
    public function stats(): Response
    {
        $fiches_count = $this->model->getFichesCount();
        $latest_fiches = $this->model->getLatestCards();
        $most_viewed_fiches = $this->model->getMostViewedCards();

        $payload = [
            'fiches_count' => $fiches_count,
            'latest_fiches' => $latest_fiches,
            'most_viewed_fiches' => $most_viewed_fiches,
        ];

        return HttpHelper::jsonResponse(new Response(), $payload);
    }
}