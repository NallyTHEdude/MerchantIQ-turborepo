import { proxy } from '@/lib/proxy';

type Context = { params: Promise<{ merchantId: string }> };

/** GET /api/verification/:merchantId */
export async function GET(_request: Request, { params }: Context) {
    const { merchantId } = await params;
    return proxy(`/verification/${encodeURIComponent(merchantId)}`);
}
