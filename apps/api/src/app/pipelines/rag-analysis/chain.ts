// do npm i @langchain/mistralai for using mistral
// import { ChatMistralAI } from '@langchain/mistralai';
// import { HumanMessage } from '@langchain/core/messages';
// import "dotenv/config"
import { ragDecisionSchema, type RagDecisionResult } from './schema';
import { ChatGroq } from '@langchain/groq';


// const ragModel = new ChatMistralAI({
//     model: 'mistral-small-latest',
//     temperature: 0,
// });

const ragModel = new ChatGroq({
    model: 'qwen/qwen3.8-27b',
    maxTokens: 900,
    temperature: 0,
});

// async function test(ragModel: any) {
//     const message = new HumanMessage('What color is the sky?');
//     const res = await ragModel.invoke([message]);
//     console.log(res);
// }
// test(ragModel);

export const structuredRagModel =
    ragModel.withStructuredOutput<RagDecisionResult>(ragDecisionSchema);
