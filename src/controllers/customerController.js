import connection from '../database.js';

export async function getCustomers(req, res) {
  const { cpf } = req.query;
  try {
    const params = [];
    let whereClause = '';

    if (cpf) {
      params.push(`${cpf}%`);
      whereClause += `WHERE cpf ILIKE $${params.length}`;
    }

    const { rows: customers } = await connection.query(
      `
    SELECT * FROM customers
    ${whereClause}
  `,
      params
    );

    res.status(200).send(customers);
  } catch (error) {
    console.log(error);
    resizeBy.sendStatus(500);
  }
}

export async function getCustomer(req, res) {
  const { id } = req.params;

  try {
    const { rows: customer, rowCount } = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.sendStatus(404);
    }

    res.status(200).send(customer[0]);
  } catch (error) {
    console.log(error);
    resizeBy.sendStatus(500);
  }
}

export async function createCustomer(req, res) {
  try {
    const newCustomer = req.body;

    const { rowCount } = await connection.query(
      'SELECT * FROM customers WHERE cpf = $1',
      [newCustomer.cpf]
    );

    if (rowCount > 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)',
      [newCustomer.name, newCustomer.phone, newCustomer.cpf, newCustomer.birthday]
    );

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    resizeBy.sendStatus(500);
  }
}

export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = req.body;

    const result = await connection.query(
      'SELECT * FROM customers WHERE cpf = $1 AND id <> $2',
      [customer.cpf, id]
    );

    if (result.rowCount > 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      `
    UPDATE customers 
    SET 
      name = $1, 
      phone = $2, 
      cpf = $3, 
      birthday = $4 
    WHERE id = $5
  `,
      [customer.name, customer.phone, customer.cpf, customer.birthday, id]
    );

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    resizeBy.sendStatus(500);
  }
}
