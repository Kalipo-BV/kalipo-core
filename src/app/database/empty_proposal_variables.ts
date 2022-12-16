import { ProposalResult } from "./enums";
import { BinaryVoteResult, MembershipInvitationArguments, MultiChoiceCount, MultiChoicePollArguments, MultiChoiceVoteResult, OptionProperties, QuestionnaireArguments, QuestionTypeArguments } from "./table/proposal_table";

//ARGUMENTS
//membership invitation arguments
export const emptyMembershipInvitationArguments: MembershipInvitationArguments = {
    accountId: "",
    message: ""
}

//multi choice poll arguments
const multiChoiceCount: MultiChoiceCount = {
    answer: "",
    count: 0
}

export const emptyMultiChoicePollArguments: MultiChoicePollArguments = {
    question: "",
    answers: [
        multiChoiceCount
    ]
}

//questionnaire arguments
const optionProperties: OptionProperties = {
    option: "",
    count: 0
}

const questionTypeArguments: QuestionTypeArguments = {
    question: "",
    options: [
        optionProperties
    ]
}

export const emptyQuestionnaireArguments: QuestionnaireArguments = {
    content: [
        questionTypeArguments
    ]
}

//RESULTS
//binary vote results
export const emptyBinaryVoteResult: BinaryVoteResult = {
    result: ProposalResult.UNDECIDED,
    memberCount: 0,
    acceptedCount: 0,
    refusedCount: 0,
    decided: BigInt(0)
}

//multi choice poll results
export const emptyMultiChoiceVoteResult: MultiChoiceVoteResult = {
    memberCount: 0,
}