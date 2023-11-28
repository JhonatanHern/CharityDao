const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO", function () {
  let dao;
  let daoToken;
  let daoNFT;
  let paymentToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PaymentToken = await ethers.getContractFactory("PaymentToken");
    const DAOToken = await ethers.getContractFactory("DAOToken");
    const DAONFT = await ethers.getContractFactory("DAONFT");
    paymentToken = await PaymentToken.deploy(
      ethers.utils.parseEther("1000000")
    );

    const DAO = await ethers.getContractFactory("DAO");
    dao = await DAO.deploy(paymentToken.address);

    daoToken = DAOToken.attach(await dao.daoToken());
    daoNFT = DAONFT.attach(await dao.daoNFT());

    await daoToken.approve(dao.address, ethers.constants.MaxUint256);
    await paymentToken.approve(dao.address, ethers.constants.MaxUint256);
  });

  describe("donate", function () {
    it("should allow a user to donate and receive voting tokens", async function () {
      const amount = ethers.utils.parseEther("100");

      await dao.donate(amount); // donate 100 funding tokens

      expect(await daoToken.balanceOf(owner.address)).to.equal(
        (await dao.votingTokenExchangeRate()).mul(amount)
      );
    });

    it("should revert if the payment token balance is not enough", async function () {
      const amount = ethers.utils.parseEther("100");

      await paymentToken.transfer(user1.address, amount.sub(1));
      await paymentToken.connect(user1).approve(dao.address, amount);

      try {
        await dao.connect(user1).donate(amount);
        assert.fail("The transaction should have thrown an error");
      } catch (error) {
        expect(error.message).to.contain("ERC20InsufficientBalance");
      }
    });

    it("should revert if the payment token approval is not enough", async function () {
      const amount = ethers.utils.parseEther("100");

      await paymentToken.transfer(user1.address, amount);
      await paymentToken.connect(user1).approve(dao.address, amount.sub(1));

      try {
        await dao.connect(user1).donate(amount);
        assert.fail("The transaction should have thrown an error");
      } catch (error) {
        expect(error.message).to.contain("ERC20InsufficientAllowance");
      }
    });
  });

  describe("createProposal", function () {
    it("should create a new proposal", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);
      const proposal = await dao.proposals(0);
      expect(proposal.deadline).to.equal(deadline);
      expect(proposal.minimumVotes).to.equal(minimumVotes);
      expect(proposal.proposedDonationAmount).to.equal(amount);
      expect(proposal.recipient).to.equal(recipient);
      expect(proposal.votesForApprove).to.equal(0);
      expect(proposal.votesForReject).to.equal(0);
    });
    it("should allow only admins to create proposals", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      // User1 is not an admin
      await expect(
        dao
          .connect(user1)
          .createProposal(deadline, minimumVotes, amount, recipient)
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("vote", function () {
    it("should allow a user to cast a vote", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);
      await dao.donate(ethers.utils.parseEther("100")); // donate 100 funding tokens

      const initialVoterBalance = await daoToken.balanceOf(owner.address);
      await dao.vote(0, 10, true);
      const finalVoterBalance = await daoToken.balanceOf(owner.address);

      const proposal = await dao.proposals(0);

      expect(proposal.votesForApprove).to.equal(10);
      expect(
        ethers.utils.formatEther(initialVoterBalance.sub(finalVoterBalance))
      ).to.equal("100.0");
    });
    it("should revert if the proposal does not exist", async function () {
      const proposalId = 0;
      const votes = 100;
      const support = true;

      await expect(dao.vote(proposalId, votes, support)).to.be.revertedWith(
        "Invalid proposal index"
      );
    });

    it("should revert if the proposal is not open", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 3600;
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);

      const proposalId = 0;
      const votes = 100;
      const support = true;

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await expect(dao.vote(proposalId, votes, support)).to.be.revertedWith(
        "Proposal deadline passed"
      );
    });

    it("should revert if the voter does not have enough voting tokens", async function () {
      const deadline = Math.floor((Date.now() + 3600 * 1000) / 1000) + 3600;
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);

      const proposalId = 0;
      const votes = 1000000;
      const support = true;

      try {
        await dao.vote(proposalId, votes, support);
        assert.fail("The transaction should have thrown an error");
      } catch (error) {
        expect(error.message).to.contain("ERC20InsufficientBalance");
      }
    });

    it("should revert if the voter has already voted", async function () {
      const deadline = Math.floor((Date.now() + 3600 * 1000) / 1000) + 3600;
      const minimumVotes = 100;
      const amount = ethers.utils.parseEther("100");
      const recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);

      const proposalId = 0;
      const votes = 10;
      const support = true;

      await dao.donate(ethers.utils.parseEther("1000"));

      await dao.vote(proposalId, votes, support);
      await expect(dao.vote(proposalId, votes, support)).to.be.revertedWith(
        "Already voted"
      );
    });
  });

  describe("executeProposal", function () {
    let deadline,
      minimumVotes,
      amount,
      recipient,
      deadlineCounter = 1;
    beforeEach(async function () {
      // create the proposal
      deadline =
        Math.floor((Date.now() + 3600 * deadlineCounter * 1000) / 1000) + 3600;
      minimumVotes = 100;
      amount = ethers.utils.parseEther("100");
      recipient = user1.address;

      await dao.createProposal(deadline, minimumVotes, amount, recipient);
    });
    it("should execute a proposal if it is approved", async function () {
      // donate 1000 funding tokens to obtain more voting tokens
      await dao.donate(ethers.utils.parseEther("1000"));

      await dao.vote(0, 100, true);
      // Increase time to past the deadline
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      deadlineCounter++;

      await dao.executeProposal(0);

      expect(await paymentToken.balanceOf(recipient)).to.equal(amount);
    });
    it("should revert if the proposal does not exist", async function () {
      const nonExistentProposalId = 1;

      await expect(
        dao.executeProposal(nonExistentProposalId)
      ).to.be.revertedWith("Invalid proposal index");
    });
    it("should revert if the deadline has not passed", async function () {
      await dao.donate(ethers.utils.parseEther("1000"));

      await dao.vote(0, 100, false);

      await expect(dao.executeProposal(0)).to.be.revertedWith(
        "Proposal deadline has not passed"
      );
    });
    it("should revert if the proposal is not approved", async function () {
      await dao.donate(ethers.utils.parseEther("1000"));

      await dao.vote(0, 100, false);

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      deadlineCounter++;

      await expect(dao.executeProposal(0)).to.be.revertedWith(
        "Proposal was not approved"
      );
    });
    it("should revert if the proposal is already executed", async function () {
      await dao.donate(ethers.utils.parseEther("1000"));

      await dao.vote(0, 100, true);

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      deadlineCounter++;

      await dao.executeProposal(0);

      await expect(dao.executeProposal(0)).to.be.revertedWith(
        "Proposal already executed"
      );
    });
  });
});
