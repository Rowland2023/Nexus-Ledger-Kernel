export const validate = (schema) => (req, res, next) => {
  // 1. Identify the actual Joi schema object
  let activeSchema = schema;

  // If the schema was wrapped in an object (e.g., { orderSchema: ... })
  if (schema && !schema.validate && schema.orderSchema) {
    activeSchema = schema.orderSchema;
  }

  // 2. Strict check before calling .validate()
  if (!activeSchema || typeof activeSchema.validate !== 'function') {
    console.error('--- ❌ VALIDATOR CRITICAL FAILURE ---');
    console.log('Provided schema:', schema);
    
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Validation schema is misconfigured." 
    });
  }

  // 3. Safe Execution
  const { error } = activeSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: "Validation Error", 
      details: error.details.map(d => d.message) 
    });
  }
  
  next();
};