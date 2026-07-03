<?php

use Doctrine\DBAL\DriverManager;
use Doctrine\Migrations\Configuration\Connection\ExistingConnection;
use Doctrine\Migrations\Configuration\Migration\PhpFile;
use Doctrine\Migrations\DependencyFactory;
use Dotenv\Dotenv;

require 'vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = DriverManager::getConnection([
    'dbname'   => $_ENV['DB_NAME'],
    'user'     => $_ENV['DB_USER'],
    'password' => $_ENV['DB_PASSWORD'],
    'host'     => $_ENV['DB_HOST'],
    'port'     => $_ENV['DB_PORT'],
    'driver'   => 'pdo_pgsql',
]);

$config = new PhpFile(__DIR__ . '/migrations/migrations.php');
return DependencyFactory::fromConnection($config, new ExistingConnection($db));