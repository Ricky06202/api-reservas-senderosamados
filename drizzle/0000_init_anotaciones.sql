CREATE TABLE `anotaciones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reserva_id` int,
	`contenido` varchar(1000) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `anotaciones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `anotaciones` ADD CONSTRAINT `anotaciones_reserva_id_reservas_id_fk` FOREIGN KEY (`reserva_id`) REFERENCES `reservas`(`id`) ON DELETE no action ON UPDATE no action;