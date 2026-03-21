import { infrastructure } from '@yourorg/shared-kernel';

export async function handleTransfer(req, res) {
  try {
    const { account_id, amount, currency, type, reference } = req.body;

    console.log(`🎯 Controller: Sending ${type} for ${account_id} to Kafka...`);

    await infrastructure.enqueueTransfer({
      account_id,
      amount,
      currency,
      type,
      reference,
    });

    res.status(202).json({
      success: true,
      message: 'Transfer accepted for processing',
      reference,
    });
  } catch (err) {
    console.error('❌ Transfer Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
