import { backendJson } from '@/lib/backend';
import { proxy, readJsonBody } from '@/lib/proxy';

/**
 * POST /api/merchant
 *
 * The backend upserts on `gstNumber`: posting an existing GST number updates
 * that merchant and returns it instead of creating a second record.
 */
export async function POST(request: Request) {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;

    return proxy('/merchant', backendJson(body.value));
}
