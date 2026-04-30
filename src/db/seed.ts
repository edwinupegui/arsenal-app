import { readFileSync } from 'node:fs';
import { db, categories, resources } from './index';

const CATEGORIES = [
  { id: 1, name: 'Arquitectura, Clean Code & Ops', icon: 'architect' },
  { id: 2, name: 'AI-Native Development & Agents', icon: 'robot' },
  { id: 3, name: 'Gamedev & Math Analysis', icon: 'gamepad' },
  { id: 4, name: 'Build Projects: UI & Full-Stack', icon: 'layers' },
  { id: 5, name: 'Recursos Adicionales', icon: 'bookmark' },
  { id: 6, name: 'Testing & Quality', icon: 'check' },
  { id: 7, name: 'Seguridad & Auth', icon: 'shield' },
  { id: 8, name: 'Base de Datos & Datos', icon: 'database' },
  { id: 9, name: 'Career & Soft Skills', icon: 'briefcase' },
  { id: 10, name: 'Tendencias & Cultura Tech', icon: 'trending' },
];

function parseResourcesMd() {
  const content = readFileSync('./recursos.md', 'utf-8');
  const lines = content.split('\n');

  const resourcesList: Array<{
    title: string;
    url: string;
    type: string;
    language: string;
    tags: string[];
    categoryId: number;
    description: string;
  }> = [];

  let currentCategoryId = 0;

  for (const line of lines) {
    const catMatch = line.match(/^## \p{L} 1\.\s+(.+?)(?:\s*\((\d+)\))?/u);
    if (catMatch) {
      const catName = catMatch[1].trim();
      const cat = CATEGORIES.find(c => catName.includes(c.name.split(',')[0].split(' & ')[0].trim()));
      if (cat) currentCategoryId = cat.id;
      continue;
    }

    const resourceMatch = line.match(/^\d+\.\s+\*\*\[(.+?)\]\((https?:\/\/[^\)]+)\)\*\*\s*-\s*(.+)/);
    if (resourceMatch && currentCategoryId > 0) {
      const title = resourceMatch[1];
      const url = resourceMatch[2];
      const description = resourceMatch[3].trim();

      let type = 'video';
      if (url.includes('github.com')) type = 'repo';
      else if (url.includes('librosgratis') || url.includes('mcpmarket') || url.includes('autoskills') || url.includes('tasteskill') || url.includes('impeccable')) type = 'tool';
      else if (url.includes('blog') || url.includes('medium')) type = 'article';

      let language = 'EN';
      if (description.includes('(ES)') || /\b(español|español|técnicas?\s+(en|es))/i.test(description)) {
        language = 'ES';
      }

      const tags: string[] = [CATEGORIES[currentCategoryId - 1].name.split(',')[0].trim().toLowerCase()];
      if (description.includes('tutorial')) tags.push('tutorial');
      if (description.includes('profesional') || description.includes('avanzado')) tags.push('avanzado');
      if (description.includes('patrones') || description.includes('patrones de diseño')) tags.push('patrones');

      resourcesList.push({
        title,
        url,
        type,
        language,
        tags,
        categoryId: currentCategoryId,
        description,
      });
    }
  }

  return resourcesList;
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  await db.delete(resources);
  await db.delete(categories);
  console.log('  Cleared existing data');

  await db.insert(categories).values(CATEGORIES);
  console.log(`  Inserted ${CATEGORIES.length} categories`);

  const resourcesList = parseResourcesMd();

  const resourcesToInsert = resourcesList.map(r => ({
    title: r.title,
    url: r.url,
    description: r.description,
    type: r.type,
    language: r.language,
    tags: r.tags,
    categoryId: r.categoryId,
    createdAt: new Date().toISOString(),
  }));

  await db.insert(resources).values(resourcesToInsert);
  console.log(`  Inserted ${resourcesList.length} resources`);
  console.log('\n✅ Seed complete!');
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Resources: ${resourcesList.length}`);
}

seed().catch(console.error);