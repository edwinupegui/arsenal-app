CREATE TABLE `categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`icono` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recursos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`url` text NOT NULL,
	`descripcion` text,
	`tags` text,
	`idioma` text NOT NULL,
	`tipo` text NOT NULL,
	`categoriaId` integer NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action
);
