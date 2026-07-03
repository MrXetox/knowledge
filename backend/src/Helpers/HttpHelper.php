<?php

namespace App\Helpers;

use App\Exceptions\AppException;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

class HttpHelper
{
    /**
     * Extrait l'identifiant depuis les arguments de la route.
     *
     * Si l'ID est absent, non numérique ou égal à 0, une exception HTTP 404 est levée.
     *
     * @param Request $request La requête HTTP.
     * @param array<string, mixed> $args Les arguments capturés par le routeur.
     *
     * @return int L'identifiant validé et converti en entier
     *
     * @throws AppException Si l'identifiant ID est introuvable ou invalide.
     */
    public static function getIdOrNotFound(Request $request, array $args): int
    {
        $id = (int) ($args['id'] ?? 0);

        if ($id === 0) {
            throw new AppException('Argument id manquant', 404);
        }

        return $id;
    }

    /**
     * Extrait le payload de la requête HTTP et le traite.
     *
     * Si le payload est absent ou invalide, une exception HTTP 422 est invalide.
     *
     * @param Request $request La requête HTTP.
     *
     * @return array Le payload de la requête formalisé.
     *
     * @throws AppException Si le payload est invalide.
     */
    public static function getPayload(Request $request): array
    {
        $payload = $request->getParsedBody();

        if (!is_array($payload)) {
            throw new AppException('Le corps de la requête est invalide.', 422);
        }

        return $payload;
    }

    /**
     * Formate les données en JSON et prépare la réponse HTTP.
     *
     * Cette méthode encode les données fournies, les écrit dans le corps de la réponse,
     * définit l'en-tête "Content-Type" sur "application/json" et applique le code de statut.
     *
     * @param Response $response La réponse HTTP initiale.
     * @param mixed $data Les données à encoder (doivent être sérialisables en JSON).
     * @param int $status Le code de statut HTTP (200 par défaut).
     *
     * @return Response La réponse HTTP modifiée contenant le JSON et les bons en-têtes.
     */
    public static function jsonResponse(Response $response, mixed $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Récupère l'utilisateur connecté, initiateur de la requête et retourne son nom
     *
     * Si le nom d'utilisateur n'est pas trouvé, la fonction retourne "Utilisateur inconnu".
     *
     * @param Request $request La requête HTTP
     *
     * @return string Le nom de l'utilisateur ou "Utilisateur inconnu"
     */
    public static function getUserName(Request $request): string
    {
        $user = $request->getAttribute('user');
        return $user['name'] ?? 'Utilisateur inconnu';
    }
}