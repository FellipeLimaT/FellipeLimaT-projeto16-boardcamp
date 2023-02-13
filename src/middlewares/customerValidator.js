import customerSchema from "../schemas/customersSchema.js";

export function validateCustomer(req, res, next) {
  const customer = req.body;
  const validation = customerSchema.validate(customer);
  if (validation.error) {
    return res.sendStatus(400); // bad request
  }

  next();
}