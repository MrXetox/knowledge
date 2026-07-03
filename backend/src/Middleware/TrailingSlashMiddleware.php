<?php

namespace App\Middleware;

use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

/**
 * Middleware de normalisation des URL.
 *
 * Supprime les slashes (/) à la fin des chemins d'URL, sauf pour la racine,
 * afin de normaliser et d'éviter les doublons de routes.
 */
class TrailingSlashMiddleware
{
    /**
     * Traite la requête en supprimant le slash terminal du chemin si présent.
     *
     * Vérifie si le chemin se termine par "/" (et n'est pas la racine "/"),
     * puis le supprime avant de passer au middleware suivant.
     *
     * @param Request $request La requête HTTP courante.
     * @param RequestHandler $handler Le gestionnaire suivant dans la chaîne middleware.
     *
     * @return Response La réponse HTTP après normalisation du chemin.
     */
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $uri = $request->getUri();
        $path = $uri->getPath();

        if ($path != '/' && str_ends_with($path, '/')) {
            $uri = $uri->withPath(substr($path, 0, -1));
            $request = $request->withUri($uri);
        }

        return $handler->handle($request);
    }
}