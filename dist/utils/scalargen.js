"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoRoute = void 0;
// utils/scalargen.ts
const zod_openapi_1 = require("@hono/zod-openapi");
const createAutoRoute = ({ method, path, tag, summary, description, requestSchema, paramSchema, querySchema, responseSchema, responses, }) => {
    const request = {};
    if (paramSchema)
        request.params = paramSchema;
    if (querySchema)
        request.query = querySchema;
    if (requestSchema) {
        request.body = {
            content: {
                "application/json": {
                    schema: requestSchema,
                },
            },
        };
    }
    const defaultResponses = {
        200: { description: "Success" },
        201: { description: "Created" },
        400: { description: "Bad Request" },
    };
    if (responseSchema) {
        defaultResponses[200].content = {
            "application/json": {
                schema: responseSchema,
            },
        };
    }
    const finalResponses = responses ? { ...defaultResponses, ...responses } : defaultResponses;
    return (0, zod_openapi_1.createRoute)({
        method,
        path,
        tags: [tag],
        summary,
        description,
        request: Object.keys(request).length ? request : undefined,
        responses: finalResponses,
    });
};
exports.createAutoRoute = createAutoRoute;
//# sourceMappingURL=scalargen.js.map