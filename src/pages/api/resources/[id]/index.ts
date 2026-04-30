import type { APIRoute } from 'astro';
import { resourceService, parseTags } from '../../../../lib/resources';
import { updateResourceSchema } from '../../../../lib/validation';
import { isOk } from '../../../../lib/result';

export const GET: APIRoute = async ({ params }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const id = parseInt(idParam);

  const result = resourceService.getResourceById(id);
  if (!isOk(result)) {
    return new Response(JSON.stringify({ error: result.error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ...result.value, tags: parseTags(result.value.tags) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const id = parseInt(idParam);

  try {
    const body = await request.json();
    const parsed = updateResourceSchema.parse(body);

    const result = resourceService.updateResource(id, parsed);
    if (!isOk(result)) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ...result.value, tags: parseTags(result.value.tags) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Validation failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const id = parseInt(idParam);

  const result = resourceService.softDeleteResource(id);
  if (!isOk(result)) {
    return new Response(JSON.stringify({ error: result.error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: { id }, message: 'Resource deleted' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};