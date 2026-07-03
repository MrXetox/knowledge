<?php

namespace App\Middleware;

use App\Exceptions\AppException;
use Firebase\JWT\JWT;
use Firebase\JWT\CachedKeySet;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

/**
 * Middleware d'authentification pour les tokens émis par Microsoft Entra ID (MSAL).
 */
class AuthMiddleware
{
    private CachedKeySet $key_set;
    private string $expected_audience
    ;
    private string $expected_issuer;

    public function __construct(
        CachedKeySet $key_set,
        string $expected_audience,
        string $expected_issuer
    ) {
        if (trim($expected_audience) === '' || trim($expected_issuer) === '') {
            throw new \InvalidArgumentException("L'audience et l'émetteur attendus doivent être renseignés.");
        }

        $this->key_set = $key_set;
        $this->expected_audience = $expected_audience;
        $this->expected_issuer = $expected_issuer;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $auth_header = $request->getHeaderLine('Authorization');

        if (empty($auth_header) || !preg_match('/^Bearer\s+(.+)$/i', $auth_header, $matches)) {
            throw new AppException("Token manquant ou invalide", 401);
        }

        $token = trim($matches[1]);

        try {
            $decoded = JWT::decode($token, $this->key_set);
        } catch (ExpiredException $e) {
            throw new AppException("Token expiré", 401);
        } catch (SignatureInvalidException $e) {
            throw new AppException("Signature du token invalide", 401);
        } catch (BeforeValidException $e) {
            throw new AppException("Token pas encore valide", 401);
        } catch (\UnexpectedValueException | \DomainException | \InvalidArgumentException $e) {
            // On concatène le message original pour le débogage
            throw new AppException("Token refusé : " . $e->getMessage(), 401);
        }

        $this->assertAudience($decoded);
        $this->assertClaim($decoded, 'iss', $this->expected_issuer);

        $user = (array) $decoded;
        $request = $request->withAttribute('user', $user);

        return $handler->handle($request);
    }

    private function assertAudience(object $payload): void
    {
        $aud = $payload->aud ?? null;
        $audiences = is_array($aud) ? $aud : [$aud];

        foreach ($audiences as $value) {
            if (is_string($value) && hash_equals($this->expected_audience, $value)) {
                return;
            }
        }

        throw new AppException("Token refusé (audience invalide)", 401);
    }

    private function assertClaim(object $payload, string $claim, string $expected): void
    {
        if (!isset($payload->$claim) || !hash_equals($expected, (string) $payload->$claim)) {
            throw new AppException("Token refusé (claim {$claim} invalide)", 401);
        }
    }
}