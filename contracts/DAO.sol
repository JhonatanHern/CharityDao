// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DAOToken.sol";
import "./DAONFT.sol";

contract DAO is AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Proposal {
        uint256 deadline;
        uint256 minimumVotes;
        uint256 votesForApprove;
        uint256 votesForReject;
        uint256 proposedDonationAmount;
        address recipient;
        bool executed;
    }
    mapping(uint256 => mapping(address => bool)) voted;

    Proposal[] public proposals;

    address public paymentToken;
    DAOToken public daoToken;
    DAONFT public daoNFT;
    uint256 public votingTokenExchangeRate = 10;

    event ProposalCreated(
        uint256 proposalId,
        uint256 deadline,
        uint256 minimumVotes,
        uint256 proposedDonationAmount,
        address recipient
    );
    event ProposalVoted(uint256 proposalId, address voter, bool inSupport);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _paymentToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        paymentToken = _paymentToken;
        daoToken = new DAOToken();
        daoNFT = new DAONFT();
    }

    /**
     * @dev Creates a new proposal in the DAO.
     * @param _deadline The deadline for the proposal, specified as a timestamp.
     * @param _minimumVotes The minimum number of votes required for the proposal to pass.
     * @param _proposedDonationAmount The amount of donation proposed in the proposal.
     * @param _recipient The address of the recipient for the proposed donation.
     */
    function createProposal(
        uint256 _deadline,
        uint256 _minimumVotes,
        uint256 _proposedDonationAmount,
        address _recipient
    ) public onlyAdmin {
        proposals.push(
            Proposal({
                deadline: _deadline,
                minimumVotes: _minimumVotes,
                votesForApprove: 0,
                votesForReject: 0,
                proposedDonationAmount: _proposedDonationAmount,
                recipient: _recipient,
                executed: false
            })
        );
        emit ProposalCreated(
            proposals.length - 1,
            _deadline,
            _minimumVotes,
            _proposedDonationAmount,
            _recipient
        );
    }

    /**
     * @dev Votes on a proposal in the DAO.
     * @param _proposalIndex The index of the proposal to vote on.
     * @param _votes The number of votes to cast (the actual cost is _votes ** 2).
     * @param _voteForApprove Boolean indicating whether the vote is for approval or rejection.
     * @dev Throws an error if the proposal index is invalid.
     * @dev Throws an error if the voter has already voted on the proposal.
     * @dev Throws an error if the proposal deadline has passed.
     * @dev Throws an error if the number of votes is invalid (zero or negative).
     * @dev Transfers the voting costs from the voter to the DAO contract.
     * @dev Mints a DAO NFT for the voter.
     * @dev Emits a ProposalVoted event with the proposal index, voter address, and vote type.
     */
    function vote(
        uint256 _proposalIndex,
        uint256 _votes,
        bool _voteForApprove
    ) public {
        require(_proposalIndex < proposals.length, "Invalid proposal index");
        Proposal storage proposal = proposals[_proposalIndex];
        require(!voted[_proposalIndex][msg.sender], "Already voted");
        require(
            block.timestamp < proposal.deadline,
            "Proposal deadline passed"
        );
        require(_votes > 0, "Invalid number of votes");
        uint256 votingCosts = _votes * _votes * (10 ** daoToken.decimals());
        if (_voteForApprove) {
            proposal.votesForApprove += _votes;
        } else {
            proposal.votesForReject += _votes;
        }
        voted[_proposalIndex][msg.sender] = true;
        IERC20(daoToken).safeTransferFrom(
            msg.sender,
            address(this),
            votingCosts
        );
        daoNFT.mint(msg.sender);
        emit ProposalVoted(_proposalIndex, msg.sender, _voteForApprove);
    }

    /**
     * @dev Executes a proposal in the DAO.
     * @param _proposalIndex The index of the proposal to execute.
     * @dev Throws an error if the proposal index is invalid.
     * @dev Throws an error if the proposal has already been executed.
     * @dev Throws an error if the proposal deadline has not passed.
     * @dev Throws an error if the minimum number of votes for the proposal has not been reached.
     * @dev Throws an error if the proposal was not approved by the votes.
     * @dev Marks the proposal as executed.
     * @dev Transfers the proposed donation amount to the recipient address.
     * @dev Emits a ProposalExecuted event with the proposal index.
     */
    function executeProposal(uint256 _proposalIndex) public {
        require(_proposalIndex < proposals.length, "Invalid proposal index");
        Proposal storage proposal = proposals[_proposalIndex];
        require(!proposal.executed, "Proposal already executed");
        require(
            block.timestamp >= proposal.deadline,
            "Proposal deadline has not passed"
        );
        require(
            proposal.votesForApprove + proposal.votesForReject >=
                proposal.minimumVotes,
            "Proposal votes not reached"
        );
        require(
            proposal.votesForApprove > proposal.votesForReject,
            "Proposal was not approved"
        );
        proposal.executed = true;
        uint256 amount = proposal.proposedDonationAmount;
        address payable recipient = payable(proposal.recipient);
        IERC20(paymentToken).safeTransfer(recipient, amount);
        emit ProposalExecuted(_proposalIndex);
    }

    /**
     * @dev Donate funds to the DAO.
     * @param _amount The amount of funds to donate.
     * @dev Throws an error if the amount is invalid (zero or negative).
     * @dev Transfers the specified amount of funds from the sender to the DAO contract.
     * @dev Mints voting tokens for the sender based on the donated amount and the voting token exchange rate.
     */
    function donate(uint256 _amount) public {
        require(_amount > 0, "Invalid amount"); // possibly redundant
        IERC20(paymentToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        uint256 votingTokens = _amount * votingTokenExchangeRate;
        daoToken.mint(msg.sender, votingTokens);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin");
        _;
    }

    /**
     * @dev Change the exchange rate of voting tokens in the DAO.
     * @param _votingTokenExchangeRate The new exchange rate for voting tokens.
     * @dev Throws an error if the caller is not an admin.
     * @dev Updates the exchange rate of voting tokens to the specified value.
     */
    function changeVotingTokenExchangeRate(
        uint256 _votingTokenExchangeRate
    ) public onlyAdmin {
        votingTokenExchangeRate = _votingTokenExchangeRate;
    }

    /**
     * @dev Adds an admin role to the specified address.
     * @param _admin The address to be granted the admin role.
     * @dev Throws an error if the caller is not an admin.
     * @dev Grants the ADMIN_ROLE to the specified address.
     */
    function addAdmin(address _admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, _admin);
    }

    /**
     * @dev Removes the admin role from the specified address.
     * @param _admin The address from which the admin role will be revoked.
     * @dev Throws an error if the caller is not an admin.
     * @dev Revokes the ADMIN_ROLE from the specified address.
     */
    function removeAdmin(address _admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, _admin);
    }

    /**
     * @dev Mints a specified amount of tokens and assigns them to a specified address.
     * @param _to The address to which the tokens will be assigned.
     * @param _amount The amount of tokens to mint.
     * @dev Throws an error if the caller is not an admin.
     * @dev Mints the specified amount of tokens and assigns them to the specified address.
     */
    function mint(address _to, uint256 _amount) public onlyAdmin {
        daoToken.mint(_to, _amount);
    }
}
