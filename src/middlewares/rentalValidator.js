import rentalsSchema from "../schemas/rentalSchema.js";

export function validateRental(req, res, next) {
  const rental = req.body;
  const validation = rentalsSchema.validate(rental);
  if (validation.error) {
    return res.sendStatus(400); // bad request
  }

  next();
}