ALTER TABLE `reservas` ADD `abono` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `reservas` ADD `comision_booking` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `reservas` ADD `estado_comision` varchar(50) DEFAULT 'pendiente';