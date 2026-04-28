import type { APIRoute } from 'astro';
import { resourceService, parseTags } from '../../../lib/resources';
import { createResourceSchema, filterSchema } from '../../../lib/validation';
import { isOk, map } from '../../../lib/result';

export const GET: APIRoute = async ({ url }) => {
  try {
    const rawParams = Object.fromEntries(url.searchParams);
    const filters = filterSchema.parse(rawParams);

    const result = resourceService.listResources({
      q: filters.q,
      categoryId: filters.categoryId,
      language: filters.language,
      type: filters.type,
    });

    if (!isOk(result)) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resources = result.value.map(r => ({
      ...r,
      tags: parseTags(r.tags),
    }));

    return new Response(JSON.stringify(resources), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid filters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = createResourceSchema.parse(body);

    // Check for duplicate URL
    const existingResult = resourceService.getResourceByUrl(parsed.url);
    if (isOk(existingResult)) {
      return new Response(
        JSON.stringify({ error: 'A resource with this URL already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = resourceService.createResource({
      title: parsed.title,
      url: parsed.url,
      description: parsed.description,
      tags: parsed.tags,
      language: parsed.language,
      type: parsed.type,
      categoryId: parsed.categoryId,
    });

    if (!isOk(result)) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ...result.value, tags: parseTags(result.value.tags) }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ error: 'Validation failed', fields: error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};