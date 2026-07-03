<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration consolidée — squash des versions :
 *   - 20260421082123 : schéma initial (articles, categories, liaisons, historique)
 *   - 20260528140039 : index GIN (tags + recherche plein texte)
 *   - 20260601142018 : colonne "position" sur categories
 *   - 20260618001558 : renommage en fiches/fiche_*, colonnes TipTap en JSONB,
 *                      suppression de "source", défaut now() sur l'historique
 *   - 20260620200910 : fonction tiptap_text() + colonne générée search_vector
 *
 * Reproduit directement l'état final du schéma en une seule passe.
 *
 * NB : les noms de contraintes historiques (fk_article, fk_history_article, …)
 * sont volontairement conservés — renommer une table ne renomme pas ses
 * contraintes, les bases déjà migrées portent donc encore ces noms-là.
 *
 * Nécessite PostgreSQL 12+ (colonnes générées STORED, jsonb_path_query).
 */
final class Version20260703022934 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Schéma de la base de données : fiches, catégories, historique et recherche';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform,
            'Cette migration ne peut être exécutée que sur PostgreSQL.'
        );

        $this->addSql(<<<'SQL'
            CREATE OR REPLACE FUNCTION tiptap_text(doc jsonb)
            RETURNS text AS $$
                SELECT string_agg(t #>> '{}', '')
                FROM jsonb_path_query(doc, 'strict $.**.text') AS t;
            $$ LANGUAGE SQL IMMUTABLE
            SQL);

        // categories
        $this->addSql(<<<'SQL'
            CREATE TABLE categories (
                id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
                special VARCHAR(100) NOT NULL,
                parent_id INT DEFAULT NULL,
                "position" INT DEFAULT 0 NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT fk_category_parent FOREIGN KEY (parent_id)
                    REFERENCES categories (id) ON DELETE CASCADE
            )
            SQL);
        $this->addSql('CREATE INDEX idx_parent ON categories (parent_id)');

        // fiches
        $this->addSql(<<<'SQL'
            CREATE TABLE fiches (
                id SERIAL NOT NULL,
                title VARCHAR(255) NOT NULL,
                views INT DEFAULT 0 NOT NULL,
                problem JSONB NOT NULL,
                notes JSONB NOT NULL,
                archived BOOLEAN DEFAULT false NOT NULL,
                tags JSONB DEFAULT NULL,
                steps JSONB NOT NULL,
                search_vector tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
                    setweight(to_tsvector('french', coalesce(tiptap_text(problem), '')), 'B') ||
                    setweight(to_tsvector('french', coalesce(tiptap_text(notes), '')), 'C')
                ) STORED,
                PRIMARY KEY (id)
            )
            SQL);
        $this->addSql('CREATE INDEX idx_fiche_tags ON fiches USING gin (tags)');
        $this->addSql('CREATE INDEX idx_fiche_search ON fiches USING gin (search_vector)');

        // fiche_category
        $this->addSql(<<<'SQL'
            CREATE TABLE fiche_category (
                fiche_id INT NOT NULL,
                category_id INT NOT NULL,
                PRIMARY KEY (fiche_id, category_id),
                CONSTRAINT fk_article FOREIGN KEY (fiche_id)
                    REFERENCES fiches (id) ON DELETE CASCADE,
                CONSTRAINT fk_category FOREIGN KEY (category_id)
                    REFERENCES categories (id) ON DELETE RESTRICT
            )
            SQL);
        $this->addSql('CREATE INDEX idx_category ON fiche_category (category_id)');

        $this->addSql(<<<'SQL'
            CREATE TABLE fiche_history (
                id SERIAL NOT NULL,
                fiche_id INT NOT NULL,
                date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                author VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                summary TEXT NOT NULL,
                changes JSONB DEFAULT NULL,
                PRIMARY KEY (id),
                CONSTRAINT fk_history_article FOREIGN KEY (fiche_id)
                    REFERENCES fiches (id) ON DELETE CASCADE
            )
            SQL);
        $this->addSql('CREATE INDEX idx_history_fiche ON fiche_history (fiche_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE fiche_history');
        $this->addSql('DROP TABLE fiche_category');
        $this->addSql('DROP TABLE fiches');
        $this->addSql('DROP TABLE categories');
        $this->addSql('DROP FUNCTION IF EXISTS tiptap_text(jsonb)');
    }
}