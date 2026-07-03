<?php

use App\Models\FicheModel;
use App\Models\CategoryModel;
use DI\Container;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;

/**
 * Configuration du conteneur d'injection de dépendances (DI).
 *
 * Ce fichier configure l'ensemble des services et dépendances utilisés par l'application.
 * Il établit les connexions à la base de données et instancie les modèles avec les dépendances requises.
 */

$container = new Container();

/**
 * Enregistre la connexion à la base de données PostgreSQL.
 *
 * Cette connexion est initialisée avec les paramètres de configuration stockés dans les variables d'environnement.
 * Elle utilise le driver PDO PostgreSQL et est utilisée par tous les modèles pour accéder à la base de données.
 *
 * @return Connection Une instance de connexion Doctrine DBAL configurée pour PostgreSQL.
 */
$container->set(Connection::class, function () {
    return DriverManager::getConnection([
        'dbname'   => $_ENV['DB_NAME'],
        'user'     => $_ENV['DB_USER'],
        'password' => $_ENV['DB_PASSWORD'],
        'host'     => $_ENV['DB_HOST'],
        'port'     => $_ENV['DB_PORT'],
        'driver'   => 'pdo_pgsql',
    ]);
});

/**
 * Enregistre le modèle FicheModel avec sa dépendance de connexion.
 *
 * Le modèle reçoit une instance de la connexion à la base de données injectée automatiquement
 * pour accéder aux données des articles.
 *
 * @param Container $container Le conteneur d'injection de dépendances.
 * @return FicheModel Une instance du modèle des articles configurée avec la connexion à la base de données.
 */
$container->set(FicheModel::class, function (Container $container) {
    $db = $container->get(Connection::class);
    return new FicheModel($db);
});

/**
 * Enregistre le modèle CategoryModel avec sa dépendance de connexion.
 *
 * Le modèle reçoit une instance de la connexion à la base de données injectée automatiquement
 * pour accéder aux données des catégories.
 *
 * @param Container $container Le conteneur d'injection de dépendances.
 * @return CategoryModel Une instance du modèle des catégories configurée avec la connexion à la base de données.
 */
$container->set(CategoryModel::class, function (Container $container) {
    $db = $container->get(Connection::class);
    return new CategoryModel($db);
});

return $container;