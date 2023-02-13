import { Router } from 'express';
import {
  getCustomer,
  getCustomers,
  createCustomer,
  updateCustomer
} from '../controllers/customerController.js';
import { validateCustomer } from '../middlewares/customerValidator.js';

const customerRouter = Router();

customerRouter.get('/customers', getCustomers);
customerRouter.get('/customers/:id', getCustomer);
customerRouter.post('/customers', validateCustomer, createCustomer);
customerRouter.put('/customers/:id', validateCustomer, updateCustomer);

export default customerRouter;
