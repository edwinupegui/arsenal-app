import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
});

export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  language: text('language').notNull(),
  type: text('type').notNull(),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
}, (table) => ({
  // Index for getResourceByUrl - must be unique
  urlIdx: index('url_idx').on(table.url),

  // Indexes for filtered queries
  categoryIdx: index('category_idx').on(table.categoryId),
  languageIdx: index('language_idx').on(table.language),
  typeIdx: index('type_idx').on(table.type),
  deletedAtIdx: index('deleted_at_idx').on(table.deletedAt),
}));

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Category = typeof categories.$inferSelect;