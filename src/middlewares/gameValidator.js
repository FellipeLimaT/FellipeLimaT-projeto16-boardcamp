import gameSchema from '../schemas/gameSchema.js';

export function validateGame(req, res, next) {
  const game = req.body;

  const validation = gameSchema.validate(game);

  if (validation.error) {
    return res.sendStatus(400); // bad request
  }

  next();
}
