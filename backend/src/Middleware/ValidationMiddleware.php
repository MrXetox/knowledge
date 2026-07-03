<?php

namespace App\Middleware;

use App\Exceptions\AppException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Respect\Validation\Validator;
use Respect\Validation\Exceptions\ValidationException;

/**
 * Middleware de validation des requêtes.
 *
 * Valide le corps de la requête (body JSON) et les fichiers téléchargés
 * selon un schéma de validation Respect\Validation fourni en injection.
 */
readonly class ValidationMiddleware implements MiddlewareInterface
{
    /**
     * Constructeur de la classe.
     *
     * @param Validator $validator Le schéma de validation Respect\Validation à appliquer.
     */
    public function __construct(private Validator $validator) {}

    /**
     * Traite la requête en validant ses données (body + fichiers) avec le schéma fourni.
     *
     * Extrait le corps de la requête et les fichiers téléchargés, les fusionne,
     * puis les valide contre le schéma. En cas d'erreur, retourne un code 422.
     *
     * @param Request $request La requête HTTP contenant les données à valider.
     * @param RequestHandler $handler Le gestionnaire suivant dans la chaîne middleware.
     *
     * @return Response La réponse HTTP après validation réussie.
     *
     * @throws AppException Si les données ne respectent pas le schéma (code 422).
     */
    public function process(Request $request, RequestHandler $handler): Response
    {
        $payload = $request->getParsedBody();
        $files = $request->getUploadedFiles();

        $body = [];
        if (is_array($payload)) {
            $body = $payload;
        } elseif (is_object($payload)) {
            $body = json_decode(json_encode($payload), true);
        }

        $data = array_merge($body, $files);

        try {
            $this->validator->assert($data);
        } catch (ValidationException $exception) {
            $messages = $exception->getMessages();
            throw new AppException($messages === [] ? 'La requête est invalide.' : implode(' | ', $messages), 422);
        }

        return $handler->handle($request);
    }
}