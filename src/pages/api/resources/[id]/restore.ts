import type { APIRoute } from 'astro';
import { resourceService } from '../../../../lib/resources';
import { isOk } from '../../../../lib/result';

export const POST: APIRoute = async ({ params }) => {
  const idParam = params.id;
  if (!idParam || isNaN(parseInt(idParam))) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/recursos/trash?error=invalid-id' },
    });
  }
  const id = parseInt(idParam);

  const result = resourceService.restoreResource(id);
  if (!isOk(result)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/recursos/trash?error=restore-failed' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: '/recursos?restored=true' },
  });
};