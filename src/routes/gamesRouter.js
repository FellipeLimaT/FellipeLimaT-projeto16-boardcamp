import { Router } from 'express';
import { getGames, createGame } from '../controllers/gameController.js';
import { validateGame } from '../middlewares/gameValidator.js';

const gamesRouter = Router();

gamesRouter.get('/games', getGames);
gamesRouter.post('/games', validateGame, createGame);

export default gamesRouter;
