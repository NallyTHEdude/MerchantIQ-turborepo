import { proxy } from '@/lib/proxy';

type Context = { params: Promise<{ merchantId: string }> };

/** GET /api/merchant/:id */
export async function GET(_request: Request, { params }: Context) {
    const { merchantId } = await params;
    return proxy(`/merchant/${encodeURIComponent(merchantId)}`);
}

/** DELETE /api/merchant/:id */
export async function DELETE(_request: Request, { params }: Context) {
    const { merchantId } = await params;
    return proxy(`/merchant/${encodeURIComponent(merchantId)}`, {
        method: 'DELETE',
    });
}
