import { backendJson } from '@/lib/backend';
import { proxy, readJsonBody } from '@/lib/proxy';

type Context = { params: Promise<{ merchantId: string }> };

/** GET /api/payment/:merchantId */
export async function GET(_request: Request, { params }: Context) {
    const { merchantId } = await params;
    return proxy(`/payment/${encodeURIComponent(merchantId)}`);
}

/**
 * POST /api/payment/:merchantId
 *
 * The body is the payment array the browser produced by parsing the uploaded
 * JSON file. The file itself is never sent to this endpoint.
 */
export async function POST(request: Request, { params }: Context) {
    const { merchantId } = await params;
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;

    return proxy(
        `/payment/${encodeURIComponent(merchantId)}`,
        backendJson(body.value),
    );
}
