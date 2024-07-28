// Pseudo code interfaces for Exchange Liquidity Adapters

interface ExchangeLiquidityAdapter {
    addLiquidity(pair: string, amount: number): Promise<TransactionReceipt>;
    removeLiquidity(pair: string, amount: number): Promise<TransactionReceipt>;
    swapTokens(pair: string, amountIn: number, amountOutMin: number): Promise<TransactionReceipt>;
    getSwapRate(pair: string, amountIn: number): Promise<number>;
}
