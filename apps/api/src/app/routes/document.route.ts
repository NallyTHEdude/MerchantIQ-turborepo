import Router from "express";
import { documentUpload } from "@/app/middlewares/document.middleware";
import { verifyAdminPassword } from "@/app/middlewares/adminAuth.middleware";
import {
  uploadGovtDocument,
  uploadMerchantDocument,
} from "@/app/controllers/document.controller";

const router = Router();

router.post("/govt", verifyAdminPassword, documentUpload, uploadGovtDocument);
router.post("/:merchantId", documentUpload, uploadMerchantDocument);

export default router;
