import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const chainIdParam = searchParams.get('chainId');
  const clientApiKey = searchParams.get('apiKey');

  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter.' }, { status: 400 });
  }

  const chainId = chainIdParam ? parseInt(chainIdParam) : 1;

  // Map chainId to block explorer API base URL and corresponding environment variable API Key
  let baseUrl = 'https://api.etherscan.io/api';
  let serverApiKey = process.env.ETHERSCAN_API_KEY;

  if (chainId === 56) {
    baseUrl = 'https://api.bscscan.com/api';
    serverApiKey = process.env.BSCSCAN_API_KEY;
  } else if (chainId === 137) {
    baseUrl = 'https://api.polygonscan.com/api';
    serverApiKey = process.env.POLYGONSCAN_API_KEY;
  } else if (chainId === 42161) {
    baseUrl = 'https://api.arbiscan.io/api';
    serverApiKey = process.env.ARBISCAN_API_KEY;
  } else if (chainId === 10) {
    baseUrl = 'https://api-optimistic.etherscan.io/api';
    serverApiKey = process.env.OPTIMISTIC_ETHERSCAN_API_KEY;
  } else if (chainId === 8453) {
    baseUrl = 'https://api.basescan.org/api';
    serverApiKey = process.env.BASESCAN_API_KEY;
  } else if (chainId === 66) {
    // OKX Chain (OKTC) simulation data
    // Return high-fidelity simulated OKTC transactions for this address
    const mockOktcTransactions = [
      {
        hash: '0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
        timeStamp: Math.floor((Date.now() - 3600000 * 2) / 1000).toString(),
        from: address,
        to: '0x3fa20000000000000000000000000000000077b1',
        value: '50000000000000000000', // 50 OKB
        gasPrice: '1000000000', // 1 Gwei
        gasUsed: '21000',
        isError: '0',
        input: '0x',
      },
      {
        hash: '0xb2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2a1',
        timeStamp: Math.floor((Date.now() - 3600000 * 24) / 1000).toString(),
        from: '0x5c8e444444444444444444444444444444448b4a',
        to: address,
        value: '100000000000000000000', // 100 OKB
        gasPrice: '1000000000',
        gasUsed: '21000',
        isError: '0',
        input: '0x',
      },
      {
        hash: '0xc3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2a1b2',
        timeStamp: Math.floor((Date.now() - 3600000 * 48) / 1000).toString(),
        from: address,
        to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // swap mock
        value: '10000000000000000000', // 10 OKB
        gasPrice: '2000000000', // 2 Gwei
        gasUsed: '65000',
        isError: '0',
        input: '0x38ed173900000000000000000000000000000000000000000000000000000000', // Router call
      },
      {
        hash: '0xd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2a1b2c3',
        timeStamp: Math.floor((Date.now() - 3600000 * 72) / 1000).toString(),
        from: address,
        to: '0xbc9d8a39b223fe8d0a0e5c4f27ead9083c75ff12', // flagged address
        value: '150000000000000000000', // 150 OKB (large/flagged)
        gasPrice: '1200000000',
        gasUsed: '21000',
        isError: '1',
        input: '0x',
      }
    ];
    return NextResponse.json({ status: '1', message: 'OK', result: mockOktcTransactions });
  }

  // Use the best available API Key: server-side specific key -> client-side key -> server-side generic Etherscan key
  const apiKey = serverApiKey || clientApiKey || process.env.ETHERSCAN_API_KEY;

  try {
    let url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc`;
    if (apiKey) {
      url += `&apikey=${apiKey}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
