import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const main = async () => {
  //USDC contract Address
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  //DAI contract Address
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  //WETH contract Address
  const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  //UNISWAP Router contract Address
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  // Impersonated account
  const AssetHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(AssetHolder);
  const impersonatedSigner = await ethers.getSigner(AssetHolder);

  // This gets contract for interaction - (tokens)
  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);
  const WETH = await ethers.getContractAt("IERC20", wethAdress);

  // This gets contract for interaction - (router)
  const ROUTER = await ethers.getContractAt("IUniSwap", UNIRouter);

  const amountOut = ethers.parseUnits("5000", 6);
  

  // Approve tokens
  const approve1 = await USDC.connect(impersonatedSigner).approve(
    UNIRouter,
    amountOut
  );

  await approve1.wait();

  //balance before swap
  const usdcBalBeforeSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalBeforeSwap = await DAI.balanceOf(impersonatedSigner.address);

  console.log(
    "USDC Balance before Swap: ",
    ethers.formatUnits(usdcBalBeforeSwap, 6)
  );
  console.log(
    "DAI Balance before Swap: ",
    ethers.formatUnits(daiBalBeforeSwap, 18)
  );

  console.log(
    "--------------------"
  );

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const swapTx = await ROUTER.connect(
    impersonatedSigner
  ).swapExactTokensForTokensSupportingFeeOnTransferTokens(
    amountOut,
    0,
    [USDCAddress, DAIAddress],
    impersonatedSigner.address,
    deadline
  );

  await swapTx.wait();

  //checking balances after swap
  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

  console.log(
    "USDC balance after Swap: ",
    ethers.formatUnits(usdcBalAfterSwap, 6)
  );
  console.log(
    "DAI balance after Swap: ",
    ethers.formatUnits(daiBalAfterSwap, 18)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});