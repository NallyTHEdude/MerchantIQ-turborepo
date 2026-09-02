import Router from "express";
import { healthCheck } from "../controllers/health.controller.js";

const router = Router();
/**
 * @swagger
 * /api/health:
 * 
 *   get:
 *      tags:
 *          - HealthCheck Endpoint
 * 
 *      summary: Health check endpoint
 *      description: Returns the health status of the API by checking availability of all external services.
 * 
 *      responses:
 *          200:
 *            description: Health status of the API
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/HealthResponse'
 *                example:
 *                  statusCode: 200
 *                  data: {}
 *                  message: Health check successful
 *                  success: true
 *          503:
 *            description: Service Unavailable - One or more external services are not healthy
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorResponse'
 *                example:
 *                  success: false
 *                  message: Health check failed
 *                  errors:
 *                    - message: Service Database is not healthy
 *                  data: null
 */
router.get("/", healthCheck);

export default router;
