# Implementation notes

## Changes made

- Added a New chat button that clears the current conversation. Previously, starting a new research session required reloading the page.
- Added conversation history to chat requests so the agent can understand follow-up questions, resolve references such as "that company" or "those risks," and build on earlier answers without making the user repeat context.
- Limited each request to the 12 most recent messages to control token usage, latency, and cost. The server validates the conversation before passing it to the agent, including its length, message roles, non-empty text, and final user message.
- Moved shared message interfaces into `src/types.ts` and conversation construction and validation into `src/conversation.ts`. Added unit tests for the message-history behavior and request validation.
- Executed independent tool calls from the same model response concurrently. In a small manual comparison, two financial lookups dropped from about 1,604 ms sequentially to about 802 ms concurrently, while a three-tool batch dropped from about 1,953 ms to about 800 ms. End-to-end results were less conclusive because model and editor latency varied between runs and dominated the total response time. With more time, I would benchmark more prompts over multiple runs and compare median latency while controlling for tool calls and agent iterations.

## Future improvements

- The 12-message cutoff can discard useful older context. A future version could summarize messages outside the window and send that summary alongside the recent conversation.
- `searchDocuments` currently uses lexical matching: it counts query terms found as substrings in each document. This can miss relevant passages that express the same idea with different words. For a larger document collection, I would add embedding-based vector search, likely combined with the existing lexical search as a hybrid approach so exact company names, tickers, and financial terms continue to match reliably.
- Add source citations /provenance to answers given especially on financial records
- Add more robust error handling , retries and timeouts
- Log tokens used in addition to the total time for each response from the model. 
- Add robust unit tests and end to end tests for the whole flow
