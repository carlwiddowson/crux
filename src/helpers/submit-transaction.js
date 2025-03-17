import { Wallet } from 'xrpl';

export default async function submitTransaction({ client, tx }) {
  try {
    const wallet = await Wallet.fromSeed(process.env.SEED);
    tx.Account = wallet.address;
    console.log('Submitting transaction with details:', tx); // Debug
    const response = await client.submit(tx, { wallet });
    console.log('Transaction Response:', response);
    return response;
  } catch (error) {
    console.error('Transaction Submission Error:', {
      message: error.message,
      stack: error.stack,
      tx: tx, // Log the transaction details
    });
    return null;
  }
}