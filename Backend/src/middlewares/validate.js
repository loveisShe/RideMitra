/**
 * Middleware factory — validates req.body against a Zod schema.
 * Returns 400 with all field errors if validation fails.
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const messages = Object.entries(errors).map(([field, msgs]) => ({
            field,
            message: msgs[0]
        }));
        return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
    }

    req.body = result.data;  // Replace body with sanitised/coerced data
    next();
};

/**
 * Middleware factory — validates req.query against a Zod schema.
 * Note: req.query is read-only in Express 5, so we store result in req.validatedQuery
 */
export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const messages = Object.entries(errors).map(([field, msgs]) => ({
            field,
            message: msgs[0]
        }));
        return res.status(400).json({ success: false, message: "Invalid query params", errors: messages });
    }

    req.validatedQuery = result.data;  // Express 5: req.query is a getter, use separate field
    next();
};
