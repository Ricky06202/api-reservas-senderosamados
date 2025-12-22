import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
} from 'drizzle-orm/mysql-core'

export const estado = mysqlTable('estado', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
})

export const casas = mysqlTable('casas', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
})

export const reservas = mysqlTable('reservas', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  casaId: int('casa_id').references(() => casas.id),
  cantPersonas: int('cant_personas').notNull(),
  estadoId: int('estado_id').references(() => estado.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
})
