<?php

namespace App\Controllers;

use App\Exceptions\AppException;
use finfo;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Random\RandomException;

/**
 * Contrôleur pour gérer les téléchargements d'images.
 *
 * Ce contrôleur traite le téléchargement et la confirmation des fichiers,
 * avec validation du type MIME et de la taille des fichiers.
 */
class UploadController
{
    private const string TEMP_DIR = __DIR__ . '/../../public/uploads/temp/';
    private const string FINAL_DIR = __DIR__ . '/../../public/uploads/final/';
    private const array ALLOWED_TYPES = [
        'image/png'  => 'png',
        'image/jpeg' => 'jpg',
    ];

    /**
     * Télécharge un fichier image en dossier temporaire après validation.
     *
     * Valide le type MIME (PNG ou JPEG) et la taille (max 5 Mo), puis génère
     * un nom de fichier aléatoire et retourne l'URL d'accès au fichier temporaire.
     *
     * @param Request $request La requête HTTP contenant le fichier à télécharger.
     * @param Response $response La réponse HTTP initiale.
     *
     * @return Response La réponse HTTP modifiée (201) contenant l'URL du fichier au format JSON.
     *
     * @throws AppException Si le fichier est invalide, trop volumineux, ou de type non supporté.
     */
    public function upload(Request $request, Response $response): Response
    {
        $file_data = $request->getUploadedFiles();
        $file = $file_data['file'] ?? null;

        if (!$file || $file->getError() !== UPLOAD_ERR_OK) {
            throw new AppException('Erreur lors du téléchargement du fichier.', 400);
        }

        if ($file->getSize() > 5242880) {
            throw new AppException('Fichier trop volumineux (max 5 Mo).', 413);
        }

        $tmp_path = $file->getStream()->getMetadata('uri');
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->file($tmp_path);

        if (!array_key_exists($mime_type, self::ALLOWED_TYPES)) {
            throw new AppException('Type de fichier non supporté.', 415);
        }

        $extension = self::ALLOWED_TYPES[$mime_type];
        try {
            $filename = bin2hex(random_bytes(8)) . '.' . $extension;
        } catch (RandomException $e) {
            throw new AppException(previous: $e);
        }
        $filepath = self::TEMP_DIR . $filename;

        $file->moveTo($filepath);

        $file_url = '/uploads/temp/' . $filename;

        $response->getBody()->write(json_encode(['url' => $file_url]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(201);
    }

    /**
     * Confirme et finalise le téléchargement du fichier en le déplaçant du dossier temporaire au dossier final.
     *
     * @param string $url L'URL du fichier temporaire.
     *
     * @return string L'URL finale du fichier validé.
     *
     * @throws AppException Si le fichier temporaire n'existe pas.
     */
    public function confirmUpload(string $url): string {
        $filename = basename($url);

        $temp_path = self::TEMP_DIR . $filename;
        $final_path = self::FINAL_DIR . $filename;

        if (file_exists($temp_path)) {
            rename($temp_path, $final_path);
            return '/uploads/final/' . $filename;
        } else {
            throw new AppException('Fichier temporaire introuvable.', 404);
        }
    }

}