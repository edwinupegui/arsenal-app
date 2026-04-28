import type { APIRoute } from 'astro';
import { resourceService } from '../../../lib/resources';
import { isOk } from '../../../lib/result';

export const GET: APIRoute = async () => {
  const result = resourceService.getAllTags();

  if (!isOk(result)) {
    return new Response(JSON.stringify({ error: result.error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(result.value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};