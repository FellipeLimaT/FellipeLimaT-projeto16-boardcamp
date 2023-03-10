import connection from '../database.js';

export async function getRentals(req, res) {
  const { customerId, gameId } = req.query;

  try {
    const params = [];
    const conditions = [];
    let whereClause = '';

    if (customerId) {
      params.push(customerId);
      conditions.push(`rentals."customerId" = $${params.length}`);
    }

    if (gameId) {
      params.push(gameId);
      conditions.push(`rentals."gameId"=$${params.length}`);
    }

    if (params.length > 0) {
      whereClause += `WHERE ${conditions.join(' AND ')}`;
    }

    const result = await connection.query(
      {
        text: `
        SELECT 
          rentals.*,
          customers.name AS customer,
          games.name as game
        FROM rentals
          JOIN customers ON customers.id=rentals."customerId"
          JOIN games ON games.id=rentals."gameId"
        ${whereClause}
      `,
        rowMode: 'array'
      },
      params
    );

    res.send(result.rows.map(_mapRentalsArrayToObject));
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function createRental(req, res) {
  const rental = req.body;
  try {
    const customersResult = await connection.query(
      `
      SELECT id FROM customers WHERE id = $1
    `,
      [rental.customerId]
    );
    if (customersResult.rowCount === 0) {
      return res.sendStatus(400); // bad request
    }

    const gameResult = await connection.query(
      `
      SELECT * FROM games WHERE id=$1
    `,
      [rental.gameId]
    );
    if (gameResult.rowCount === 0) {
      return res.sendStatus(400); // bad request
    }
    const game = gameResult.rows[0];

    const result = await connection.query(
      `
      SELECT id
      FROM rentals 
      WHERE "gameId" = $1 AND "returnDate" IS null
    `,
      [rental.gameId]
    );

    if (result.rowCount > 0) {
      if (game.stockTotal === result.rowCount) {
        return res.sendStatus(400); // bad request
      }
    }

    const originalPrice = rental.daysRented * game.pricePerDay;
    await connection.query(
      `
      INSERT INTO 
        rentals (
          "customerId", "gameId", "rentDate", 
          "daysRented", "returnDate", "originalPrice", "delayFee"
        )
        VALUES ($1, $2, NOW(), $3, null, $4, null); 
      `,
      [rental.customerId, rental.gameId, rental.daysRented, originalPrice]
    );

    res.sendStatus(201); // created
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // internal server error
  }
}

export async function finishRental(req, res) {
  const { id } = req.params;
  try {
    const result = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);

    if (result.rowCount === 0) return res.sendStatus(404); // not found

    const rental = result.rows[0];
    if (rental.returnDate) return res.sendStatus(400); // bad request
    else {
      const diff = new Date().getTime() - new Date(rental.rentDate).getTime();
      const diffInDays = Math.floor(diff / (24 * 3600 * 1000));

      let delayFee = 0;
      if (diffInDays > rental.daysRented) {
        const addicionalDays = diffInDays - rental.daysRented;
        delayFee = addicionalDays * rental.originalPrice;
        console.log('delayFee', addicionalDays);
      }

      await connection.query(
        `
        UPDATE rentals 
        SET "returnDate" = NOW(), "delayFee" = $1
        WHERE id = $2    
      `,
        [delayFee, id]
      );

      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // internal server error
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;
  try {
    const result = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      res.sendStatus(404); // not found
    } else {
      const rental = result.rows[0];
      if (!rental.returnDate) res.sendStatus(400); // bad request
      else {
        await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
      }
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // internal server error
  }
}

function _mapRentalsArrayToObject(row) {
  const [
    id,
    customerId,
    gameId,
    rentDate,
    daysRented,
    returnDate,
    originalPrice,
    delayFee,
    customerName,
    gameName
  ] = row;

  return {
    id,
    customerId,
    gameId,
    rentDate,
    daysRented,
    returnDate,
    originalPrice,
    delayFee,
    customer: {
      id: customerId,
      name: customerName
    },
    game: {
      id: gameId,
      name: gameName
    }
  };
}
