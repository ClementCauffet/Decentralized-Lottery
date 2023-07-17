const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

//testing stuff

describe("Loto init", function () {
  before(async function () {
    Loto = await ethers.getContractFactory("Loto");
    loto = await Loto.deploy();

    [owner, adr1, adr2, adr3] = await ethers.getSigners();
    var data = [[adr1], [adr2], [adr3]];
  });

  it("Contract should have a manager address equal to deployer address", async function () {
    var manager_address = await loto.manager();
    var deployer_address = owner.address;

    expect(manager_address).to.equal(deployer_address);
  });

  it("Contract should allow users to join the lottery if msg.value > 1 ETH", async function () {
    Loto = await ethers.getContractFactory("Loto");
    loto = await Loto.deploy();

    await loto.connect(adr1).enter({ value: ethers.utils.parseEther("1") });
    await loto.connect(adr2).enter({ value: ethers.utils.parseEther("1") });
    await loto.connect(adr3).enter({ value: ethers.utils.parseEther("1") });
  });

  it("Contract should allow manager to call the Lottery Election", async function () {
    console.log("Balance : ");
    console.log(await loto.getBalance(loto.address));

    winner = await loto.pickWinner();
    //console.log(winner);

    // console.log(await ethers.provider.getBalance(adr1.address));
    // console.log(await ethers.provider.getBalance(adr2.address));
    // console.log( await ethers.provider.getBalance(adr3.address));

    console.log("WINNER :", await loto.getWinner());
    console.log("Balance : ");
    console.log(await loto.getBalance(loto.address));
  });

  it("Contract should not allow iencli to call the Lottery Election", async function () {
    await loto.connect(adr1).enter({ value: ethers.utils.parseEther("1") });
    await loto.connect(adr2).enter({ value: ethers.utils.parseEther("1") });
    await loto.connect(adr3).enter({ value: ethers.utils.parseEther("1") });

    await expect(loto.connect(adr1).pickWinner()).to.be.revertedWith(
      "User is not a manager"
    );

    console.log(await ethers.provider.getBalance(adr1.address));
    console.log(await ethers.provider.getBalance(adr2.address));
    console.log(await ethers.provider.getBalance(adr3.address));

    console.log(await loto.winner());
  });
});
