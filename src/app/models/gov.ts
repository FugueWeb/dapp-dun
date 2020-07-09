export class Gov {
    beneficiary: string;
    amount: number;
    justification: string;
    data: string;
    account: string;
    balance: number;
    proposal: {
        amount: number;
        desc: string;
        executed: boolean;
        minExecutionDate: number;
        numberOfVotes: number;
        proposalHash: string;
        proposalPassed: boolean;
        beneficiary: string;
        clicked: boolean;
    };
    proposalNum: number;
    vote: boolean;
    checkProp: string;
    tokenAddr: string;
    quorum: number;
    minMinutes: number;
    newOwner: string;
    convert_wei: number;
    convert_ether: number;
    reputation: number;
    DUNbalance: number;
    participantETHBalance: number;
    participants: string[];
}