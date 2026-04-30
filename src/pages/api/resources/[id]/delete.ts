import type { APIRoute } from 'astro';
import { resourceService } from '../../../../lib/resources';
import { isOk } from '../../../../lib/result';

export const POST: APIRoute = async ({ params }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const id = parseInt(idParam);

  // Check existence first
  const existingResult = resourceService.getResourceById(id);
  if (!isOk(existingResult) || existingResult.value.deletedAt) {
    return new Response(JSON.stringify({ error: 'Resource not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = resourceService.softDeleteResource(id);
  if (!isOk(result)) {
    return new Response(JSON.stringify({ error: 'Delete failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: { id }, message: 'Resource deleted' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};