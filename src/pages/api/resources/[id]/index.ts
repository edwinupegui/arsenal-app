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

export const POST: APIRoute = async ({ params, request, url }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const id = parseInt(idParam);

  // Parse custom method override via query param or hidden input
  const method = url.searchParams.get('_method') || 'POST';

  if (method.toUpperCase() === 'DELETE') {
    const result = resourceService.softDeleteResource(id);
    if (!isOk(result)) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Redirect when coming from HTML form
    return new Response(null, {
      status: 303,
      headers: {
        'Location': '/recursos?deleted=true'
      }
    });
  }

  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
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

  // Si la petición viene de un formulario HTML (POST con _method=DELETE), redirigir
  if (request.headers.get('accept')?.includes('text/html') || request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    return new Response(null, {
      status: 303,
      headers: {
        'Location': '/recursos?deleted=true'
      }
    });
  }

  return new Response(JSON.stringify({ success: result.value }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};