<?php

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$config = Dotenv::createImmutable(__DIR__ . '/../');
$config->load();

$containers = require __DIR__ . '/../src/containers.php';
AppFactory::setContainer($containers);

$app = AppFactory::create();

$routes = require __DIR__ . '/../src/routes.php';
$routes($app);

$middlewares = require __DIR__ . '/../src/middlewares.php';
$middlewares($app);

$app->run();