[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/gQNXeTiZ)
# FunctionAgents
Call Function from LLM

---

### Implemented features
*Please see "submit" folder.
- **[already implemented in L03] Use existing js codes if applicable** - realized in L03 (on which following features are implemented).
- **[required] Create js functions (if given the example prompt format)** When you give a prompt in the example format (specifying the output code format), the server detects/extracts the code from the OpenAI API and save it as a file in the "functions" filder.
- **[additional?] Create js functions from general questions (if possible)** Even when you give more general prompt not in the example format (e.g. "Is 1001 a prime number?"), the server creates a generalized js code (e.g. checkIfPrime.js) by sending/processing a meta prompt requiring the general code to solve the question. This seems to work for at least mathematical questions (e.g. calculate some probability) and other programmable requests (e.g. count the number of letters in a sentence), but it may not work for too general questions.
