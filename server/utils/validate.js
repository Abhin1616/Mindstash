const validate = (schema, data) => {
    const { error, value } = schema.validate(data);
    if (error) {
        const field = error.details[0]?.context?.key;
        return { valid: false, error: error.details[0].message, field };
    }
    return { valid: true, value };
};
export default validate;
