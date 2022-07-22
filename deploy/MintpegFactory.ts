/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../scripts/verify";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const mintpegFactoryContract = await deploy("MintpegFactory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  await verify(
    hre,
    "contracts/MintpegFactory.sol:MintpegFactory",
    mintpegFactoryContract.address,
    []
  );
};
module.exports.tags = ["MintpegFactory"];