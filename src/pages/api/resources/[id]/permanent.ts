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

  const result = resourceService.permanentDeleteResource(id);
  if (!isOk(result)) {
    return new Response(JSON.stringify({ error: 'Permanent delete failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: { id }, message: 'Resource permanently deleted' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};