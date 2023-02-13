import { Router } from 'express';
import {
  deleteRental,
  getRentals,
  createRental,
  finishRental
} from '../controllers/rentalController.js';
import { validateRental } from '../middlewares/rentalValidator.js';

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', validateRental, createRental);
rentalsRouter.post('/rentals/:id/return', finishRental);
rentalsRouter.delete('/rentals/:id', deleteRental);

export default rentalsRouter;
