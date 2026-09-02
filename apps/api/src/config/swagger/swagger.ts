import { type Request, type Response, Router } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import { config } from "@/config/env/index";
import { componentSchemas } from "./component-schemas.js";
// @ts-expect-error swagger-model-validator does not provide TypeScript declarations by default, hence ignore
import swaggerModelValidator from "swagger-model-validator";
import swaggerUi from "swagger-ui-express";

const router = Router();

const options: swaggerJsdoc.Options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Merchant Analyzer API",
            version: "1.0.0",
            description: "API documentation for the Merchant Analyzer project.",
        },
        tags: [
            {
                name: "HealthCheck Endpoint",
                description: "Endpoint related to health check of the API."
            },
            {
                name: "Merchant Endpoints",
                description: "Endpoints related to merchant management."
            },
            {
                name: "Payment Endpoints",
                description: "Endpoints related to payment management."
            },
            {
                name: "Verification Endpoints",
                description: "Endpoints related to verification management."
            }
        ],
        servers: [
            {
                url: `http://localhost:${config.PORT}`,
                description: "Local development server"
            }
        ],
        components: {
            securitySchemes: {},
            schemas: componentSchemas
        }
    },
    apis: [
        "./src/app/routes/health.route.ts",
        "./src/app/routes/merchant.route.ts",
        "./src/app/routes/payment.route.ts",
        "./src/app/routes/verification.route.ts",
    ],
}

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions = {
    customSiteTitle: "Merchant Analyzer API Docs",
    swaggerOptions: {
        docExpansion: "list",
        defaultModelsExpandDepth: 0,
        defaultModelExpandDepth: 2,
        defaultModelRendering: "example",
        displayRequestDuration: true,
        filter: true,
        persistAuthorization: true,
    },
    customCss: `
        .swagger-ui .topbar {
            background-color: #111827;
            border-bottom: 1px solid #374151;
        }

        .swagger-ui .topbar .wrapper {
            align-items: center;
            display: flex;
            gap: 16px;
        }

        .swagger-ui .topbar::after {
            color: #e5e7eb;
            content: "Merchant Analyzer API";
            font-size: 15px;
            font-weight: 600;
            margin-left: 16px;
        }

        .swagger-ui .json-link {
            background: #2563eb;
            border-radius: 6px;
            color: #ffffff;
            display: inline-flex;
            font-family: sans-serif;
            font-size: 13px;
            font-weight: 700;
            line-height: 1;
            margin: 16px 0 0;
            padding: 10px 14px;
            text-decoration: none;
        }

        .swagger-ui .json-link:hover {
            background: #1d4ed8;
            color: #ffffff;
            text-decoration: none;
        }

        .swagger-ui .info {
            margin: 32px 0 24px;
        }

        .swagger-ui .scheme-container,
        .swagger-ui .models {
            border-radius: 8px;
            box-shadow: none;
        }

        .swagger-ui .opblock {
            border-radius: 8px;
        }

        .swagger-ui .model-box {
            border-radius: 6px;
        }
    `,
    customJsStr: `
        window.addEventListener("load", function () {
            var info = document.querySelector(".swagger-ui .info");
            if (!info || document.querySelector(".swagger-ui .json-link")) {
                return;
            }

            var link = document.createElement("a");
            link.className = "json-link";
            link.href = "/api-docs/json";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open JSON";
            info.appendChild(link);
        });
    `,
};


// validate swagger spec against the OpenAPI 3.0 specification
// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- swagger-model-validator ships no type declarations
swaggerModelValidator(swaggerSpec);


// Serve swagger endpoints
router.get("/json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

export default router;
