import { httpStatusCode } from './httpStatusCode';

const conversationResponse = {
    CONVERSATION_NOT_FOUND: {
        status: httpStatusCode.NOT_FOUND,
        message: 'Conversation not found',
    },
};

export default conversationResponse;
