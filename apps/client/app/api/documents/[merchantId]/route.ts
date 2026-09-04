import { forwardDocument } from '@/lib/proxy';

type Context = { params: Promise<{ merchantId: string }> };

/**
 * POST /api/document/:merchantId — the final step of merchant creation.
 *
 * The backend uploads the PDF, creates the verification record, and dispatches
 * the verification, document-ingestion and investigation pipelines, so the
 * frontend must never create a verification or investigation itself.
 */
export async function POST(request: Request, { params }: Context) {
    const { merchantId } = await params;
    return forwardDocument(
        request,
        `/document/${encodeURIComponent(merchantId)}`,
    );
}
