import { infrastructure } from '@yourorg/shared-kernel';
const { primaryPool } = infrastructure;

export const transferFunds = async (fromUserId, toUserId, amount) => {
  const client = await primaryPool.connect();

  try {
    await client.query('BEGIN');

    // 1. CHECK BALANCE
    const { rows } = await client.query(
      'SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE', 
      [fromUserId]
    );
    if (!rows[0] || rows[0].balance < amount) throw new Error('Insufficient funds');

    // 2. EXECUTE TRANSFER
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE user_id = $2', [amount, fromUserId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE user_id = $2', [amount, toUserId]);

    // 3. ATOMIC OUTBOX INSERT (Reliability)
    await client.query(
      "INSERT INTO outbox (event_type, payload) VALUES ($1, $2)",
      ['FUNDS_TRANSFERRED', JSON.stringify({ fromUserId, toUserId, amount })]
    );

    await client.query('COMMIT');
    return { fromUserId, toUserId, amount };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};