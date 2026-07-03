<?php

namespace App\Middleware;

use App\Exceptions\AppException;
use App\Helpers\HttpHelper;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

/**
 * Middleware de gestion globale des exceptions.
 *
 * Capture toutes les exceptions levées dans la requête et les traduit
 * en réponses HTTP JSON structurées avec code d'erreur approprié.
 */
class ExceptionMiddleware
{
    /**
     * Traite la requête et capture les exceptions pour les convertir en réponses JSON.
     *
     * Gère les trois types d'exceptions
     * – Throwable : autres erreurs inattendues (code 500)
     *
     * @param Request $request La requête HTTP courante.
     * @param RequestHandler $handler Le gestionnaire suivant dans la chaîne middleware.
     *
     * @return Response La réponse HTTP avec le code et le message d'erreur en JSON.
     */
     public function __invoke(Request $request, RequestHandler $handler): Response
     {
         try {
             return $handler->handle($request);
         } catch (AppException $exception) {
             $code = $exception->getCode();
             $status = ($code >= 100 && $code < 600) ? $code : 500;

             error_log($exception->getMessage());

             return HttpHelper::jsonResponse(
                 new Response(),
                 ['message' => $exception->getMessage() !== '' ? $exception->getMessage() : 'Une erreur technique interne est survenue.'],
                 $status
             );
         }
     }
}