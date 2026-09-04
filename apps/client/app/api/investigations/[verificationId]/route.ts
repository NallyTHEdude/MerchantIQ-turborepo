import { proxy } from '@/lib/proxy';

type Context = { params: Promise<{ verificationId: string }> };

/**
 * GET /api/investigation/:verificationId
 *
 * Returns 404 with `Investigation not found or invalid verificationId` while
 * the investigation pipeline is still running, which the UI renders as a
 * pending state rather than an error.
 */
export async function GET(_request: Request, { params }: Context) {
    const { verificationId } = await params;
    return proxy(`/investigation/${encodeURIComponent(verificationId)}`);
}
