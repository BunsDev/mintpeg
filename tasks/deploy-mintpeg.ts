/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import { loadLaunchConfig, delay } from "./utils";
import { BigNumber } from "ethers";
import verify from "scripts/verify";

interface MintpegDeployProps {
  configFilename: string;
}

task("deploy-mintpeg", "Deploys an instance of Mintpeg contract")
  .addParam("configFilename")
  .setAction(async ({ configFilename }: MintpegDeployProps, hre) => {
    console.log("-- Deploying Mintpeg --");

    const ethers = hre.ethers;
    const mintpegFactoryAddress: string = (
      await hre.deployments.get("MintpegFactory")
    ).address;
    const factory = await ethers.getContractAt(
      "MintpegFactory",
      mintpegFactoryAddress
    );

    console.log("-- Checking for Mintpeg implementation --");
    const mintpegImplementation: string = await factory.mintpegImplementation();

    if (mintpegImplementation === ethers.constants.AddressZero) {
      await hre.run("set-mintpeg-implementation");
    }

    const initConfig = loadLaunchConfig(configFilename);
    const creationTx = await factory.createMintpeg(
      initConfig.name,
      initConfig.symbol,
      initConfig.royaltyReceiver,
      initConfig.fee
    );
    await creationTx.wait();

    const mintpegNumber: BigNumber = await factory.getTotalMintpegsCount();
    const mintpegAddress: string = await factory.allMintpegs(
      mintpegNumber.sub(BigNumber.from(1))
    );

    console.log(`-- Mintpeg deployed at ${mintpegAddress} --`);

    const delayTime = 60;
    console.log(
      `-- Waiting for ${delayTime} seconds for Snowtrace to index Mintpeg Contract --`
    );
    await delay(delayTime);
    await verify(hre, "contracts/Mintpeg.sol:Mintpeg", mintpegAddress, []);
  });