import { defineRelations } from "drizzle-orm";

import { investigations } from "../investigations.schema";
import { merchants } from "../merchants.schema";
import { payments } from "../payments.schema";
import { verifications } from "../verifications.schema";

export const relations = defineRelations(
  {
    merchants,
    verifications,
    payments,
    investigations,
  },
  (r) => ({
    merchants: {
      verifications: r.many.verifications(),
      payments: r.many.payments(),
    },

    verifications: {
      merchant: r.one.merchants({
        from: r.verifications.merchantId,
        to: r.merchants.id,
      }),

      investigation: r.one.investigations({
        from: r.verifications.id,
        to: r.investigations.verificationId,
      }),
    },

    payments: {
      merchant: r.one.merchants({
        from: r.payments.merchantId,
        to: r.merchants.id,
      }),
    },

    investigations: {
      verification: r.one.verifications({
        from: r.investigations.verificationId,
        to: r.verifications.id,
      }),
    },
  }),
);
