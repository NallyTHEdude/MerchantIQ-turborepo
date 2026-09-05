
import { ragDecisionSchema, type RagDecisionResult } from './schema';
import { ChatGroq } from '@langchain/groq';



const ragModel = new ChatGroq({
    model: 'qwen/qwen3.8-27b',
    maxTokens: 700,
    temperature: 0,
});



export const structuredRagModel =
    ragModel.withStructuredOutput<RagDecisionResult>(ragDecisionSchema);
