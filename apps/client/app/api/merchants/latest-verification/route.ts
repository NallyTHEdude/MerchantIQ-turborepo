import { proxy } from '@/lib/proxy';

/** GET /api/merchant/all/latest-verification */
export async function GET() {
    return proxy('/merchant/all/latest-verification', {
        method: 'GET',
    });
}
