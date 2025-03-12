import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI} from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";
import "dotenv/config";

// Initialize Express server
const app = express();
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(process.cwd(), './public')));

// OpenAI API configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
let state = {
    chatgpt:false,
    assistant_id: "",
    assistant_name: "",
    dir_path: "",
    news_path: "",
    thread_id: "",
    user_message: "",
    run_id: "",
    run_status: "",
    vector_store_id: "",
    tools:[],
    parameters: []
  };
// Default route to serve index.html for any undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), './public/index.html'));
});
async function getFunctions() {
   
    const files = fs.readdirSync(path.resolve(process.cwd(), "./functions"));
    const openAIFunctions = {};

    for (const file of files) {
        if (file.endsWith(".js")) {
            const moduleName = file.slice(0, -3);
            const modulePath = `./functions/${moduleName}.js`;
            const { details, execute } = await import(modulePath);

            openAIFunctions[moduleName] = {
                "details": details,
                "execute": execute
            };
        }
    }
    return openAIFunctions;
}

// Route to interact with OpenAI API
app.post('/api/execute-function', async (req, res) => {
    const { functionName, parameters } = req.body;

    // Import all functions
    const functions = await getFunctions();

    if (!functions[functionName]) {
        return res.status(404).json({ error: 'Function not found' });
    }

    try {
        // Call the function
        const result = await functions[functionName].execute(...Object.values(parameters));
        console.log(`result: ${JSON.stringify(result)}`);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Function execution failed', details: err.message });
    }
});

function meta_prompt(prmpt){
    return `Write a generalized Javascript function needed to answer a request "${prmpt}".
Name the function "execute" and provide a "details" variable that conforms to the OpenAI schema. Here is an example of a function and details: 
const execute = async (num1, num2) => {
   return { result: num1 + num2 };
 };
 const details = {
   type: "function",
   function: {
       name: 'addNumbers',
       parameters: {
           type: 'object',
           properties: {
               num1: {
                   type: 'number',
                   description: 'First number to add'
               },
               num2: {
                   type: 'number',
                   description: 'Second number to add'
               }
           },
           required: ['num1', 'num2']
       },
   },
   description: 'This function adds two numbers and returns the result.'
 };
  export { execute, details };
`;
}

function addFunctionAsFile(mes){
    const code_start_delimiter = "```javascript\n";
    const end_delimiter = "```";
    const code_start_index = mes.indexOf(code_start_delimiter);
    const code_end_index = mes.lastIndexOf(end_delimiter);
    if(code_start_index>=0 && code_end_index>code_start_index){
        const code_part = mes.slice(code_start_index+code_start_delimiter.length, code_end_index);
        console.log(code_part);
        const funcname = code_part.slice(code_part.indexOf("name: '")+7, code_part.indexOf("'", code_part.indexOf("name: '")+7));
        try {
            fs.writeFileSync("./functions/"+funcname+".js", code_part);
            return funcname;
        }catch(file_write_error){
            console.log(`File write failed: ${file_write_error}`);
        }
    }
    return ""
}

// Example to interact with OpenAI API and get function descriptions
app.post('/api/openai-call', async (req, res) => {
    console.log("/api/openai-call");
    const { user_message } = req.body;
    console.log(`User message: ${user_message}`);

    const functions = await getFunctions();
    const availableFunctions = Object.values(functions).map(fn => fn.details);
    console.log(`availableFunctions: ${JSON.stringify(availableFunctions)}`);
    let messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: user_message }
    ];
    try {
        // Make OpenAI API call
        console.log("Calling OpenAI API..");
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            tools: availableFunctions
        });
        console.log("OpenAI API responded!");
       
       // Extract the arguments for get_delivery_date
// Note this code assumes we have already determined that the model generated a function call. See below for a more production ready example that shows how to check if the model generated a function call
        console.log(response.choices[0].message);

        if(!response.choices[0].message.tool_calls){
            const mes = response.choices[0].message.content;
            const funcname = addFunctionAsFile(mes);
            if(funcname!=""){
                return res.json({ message:`Function "${funcname}" has been added!`, state: state });
            } else {
                const messages_meta = [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: meta_prompt(user_message) }
                ];
                try {
                    // Make OpenAI API call
                    console.log("Calling OpenAI API (for meta prompt)..");
                    const response_meta = await openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: messages_meta
                    });
                    console.log(`OpenAI API responded!`);
                    const mes_meta = response_meta.choices[0].message.content;
                    const funcname_meta = addFunctionAsFile(mes_meta);
                    if(funcname_meta!=""){
                        console.log(mes+"\n"+`Function "${funcname_meta}" has been added for later use!`);
                        return res.json({ message:`${mes}
                            ##Function "${funcname_meta}" has been added for later use!`, state: state });
                    }
                } catch(meta_pr_error){
                    console.log("Meta prompt failed.");
                }
            }
            return res.json({ message:mes, state: state });
        } else {
            const toolCall = response.choices[0].message.tool_calls[0];
            // Extract the arguments for get_delivery_date
            // Note this code assumes we have already determined that the model generated a function call. 
            if (toolCall) {
                const functionName = toolCall.function.name;
                const parameters = JSON.parse(toolCall.function.arguments);
                console.log(`Function "${functionName}" is used!`);

                const result = await functions[functionName].execute(...Object.values(parameters));
            // note that we need to respond with the function call result to the model quoting the tool_call_id
                const function_call_result_message = {
                    role: "tool",
                    content: JSON.stringify({
                        result: result
                    }),
                    tool_call_id: response.choices[0].message.tool_calls[0].id
                };
                // add to the end of the messages array to send the function call result back to the model
                messages.push(response.choices[0].message);
                messages.push(function_call_result_message);
                const completion_payload = {
                    model: "gpt-4o",
                    messages: messages,
                };
                // Call the OpenAI API's chat completions endpoint to send the tool call result back to the model
                const final_response = await openai.chat.completions.create({
                    model: completion_payload.model,
                    messages: completion_payload.messages
                });
                // Extract the output from the final response
                let output = final_response.choices[0].message.content 
                res.json({ message:output+` ##local function "${functionName}" is used!`, state: state });
            } else {
                res.json({ message: 'No function call detected.' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'OpenAI API failed', details: error.message });
    }
});
app.post('/api/prompt', async (req, res) => {
    // just update the state with the new prompt
    state = req.body;
    try {
        res.status(200).json({ message: `got prompt ${state.user_message}`, "state": state });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'User Message Failed', "state": state });
    }
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
