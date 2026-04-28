-- Phase 0: Rename tables and columns from Spanish to English
-- Migration for recursos-app naming standardization

-- Rename 'categorias' table to 'categories'
ALTER TABLE `categorias` RENAME TO `categories`;
-- Rename columns
ALTER TABLE `categories` RENAME COLUMN `nombre` TO `name`;
ALTER TABLE `categories` RENAME COLUMN `icono` TO `icon`;

-- Rename 'recursos' table to 'resources'
ALTER TABLE `recursos` RENAME TO `resources`;
-- Rename columns
ALTER TABLE `resources` RENAME COLUMN `titulo` TO `title`;
ALTER TABLE `resources` RENAME COLUMN `descripcion` TO `description`;
ALTER TABLE `resources` RENAME COLUMN `idioma` TO `language`;
ALTER TABLE `resources` RENAME COLUMN `tipo` TO `type`;
ALTER TABLE `resources` RENAME COLUMN `categoriaId` TO `category_id`;
ALTER TABLE `resources` RENAME COLUMN `createdAt` TO `created_at`;
ALTER TABLE `resources` RENAME COLUMN `deletedAt` TO `deleted_at`;