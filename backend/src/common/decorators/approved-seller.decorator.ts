import { SetMetadata } from '@nestjs/common';

export const APPROVED_SELLER_KEY = 'requireApprovedSeller';

/**
 * Exige un vendeur APPROVED (et non PENDING / REJECTED / SUSPENDED).
 * Contrôlé par SellerApprovedGuard, côté serveur, jamais côté frontend.
 */
export const RequireApprovedSeller = () => SetMetadata(APPROVED_SELLER_KEY, true);
