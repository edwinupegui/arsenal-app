import type { APIRoute } from 'astro';
import { resourceService } from '../../../../lib/resources';
import { isOk } from '../../../../lib/result';

export const POST: APIRoute = async ({ params }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/recursos?error=invalid-id' },
    });
  }
  const id = parseInt(idParam);

  // Check existence first
  const existingResult = resourceService.getResourceById(id);
  if (!isOk(existingResult) || existingResult.value.deletedAt) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/recursos?error=not-found' },
    });
  }

  const result = resourceService.softDeleteResource(id);
  if (!isOk(result)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/recursos?error=delete-failed' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: '/recursos?deleted=true' },
  });
};