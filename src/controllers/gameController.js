import connection from '../database.js';

export async function getGames(req, res) {
  /* const { name } = req.query;

  try {
    const params = [];
    let whereClause = '';

    if (name) {
      params.push(`${name}%`);
      whereClause += `WHERE games.name ILIKE $${params.length}`;
    }

    const result = await connection.query(
      `
      'SELECT * FROM games WHERE id = $1'
      ${whereClause}
    `,
      params
    );

    res.send(result.rows); */

    const { id } = req.params;

  try {
    const { rows: games, rowCount } = await connection.query(
      'SELECT * FROM games WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.sendStatus(404);
    }

    res.status(200).send(games[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // internal server error
  }
}
export async function createGame(req, res) {
  try {
    const newGame = req.body;

    await connection.query(
      'INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4)',
      [
        newGame.name,
        newGame.image,
        Number(newGame.stockTotal),
        Number(newGame.pricePerDay)
      ]
    );
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    resizeBy.sendStatus(500);
  }
}
