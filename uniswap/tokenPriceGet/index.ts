import { ethers } from 'ethers';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

interface PoolState {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

export async function getTokenPrice(
  provider: ethers.Provider,
  poolAddress: string,
  tokenA: Token,
  tokenB: Token
): Promise<number> {
  try {
    // Create pool contract instance
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    );

    // Get pool state
    const [slot0, liquidity] = await Promise.all([
      poolContract.slot0(),
      poolContract.liquidity(),
    ]);

    const poolState: PoolState = {
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
      observationIndex: slot0[2],
      observationCardinality: slot0[3],
      observationCardinalityNext: slot0[4],
      feeProtocol: slot0[5],
      unlocked: slot0[6],
    };

    // Create Pool instance
    const pool = new Pool(
      tokenA,
      tokenB,
      3000, // fee tier (common fee tiers: 500, 3000, 10000)
      poolState.sqrtPriceX96.toString(), // Convert bigint to string
      poolState.liquidity.toString(), // Convert bigint to string
      poolState.tick
    );

    // Get token price
    const price = pool.token0Price.toSignificant(6);
    return parseFloat(price);
  } catch (error) {
    console.error('Error getting token price:', error);
    throw error;
  }
}

// Example usage:
/*
const WETH = new Token(
  1, // mainnet
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address
  18,
  'WETH',
  'Wrapped Ether'
);

const USDC = new Token(
  1, // mainnet
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC address
  6,
  'USDC',
  'USD Coin'
);

const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const poolAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'; // USDC/WETH pool

const price = await getTokenPrice(provider, poolAddress, WETH, USDC);
console.log(`Price: ${price} USDC per WETH`);
*/
