const execute = async (num1, num2) => {
   return { result: num1 - num2 };
};

const details = {
   type: "function",
   function: {
       name: 'subtractNumbers',
       parameters: {
           type: 'object',
           properties: {
               num1: {
                   type: 'number',
                   description: 'The number from which to subtract'
               },
               num2: {
                   type: 'number',
                   description: 'The number to subtract'
               }
           },
           required: ['num1', 'num2']
       },
   },
   description: 'This function subtracts the second number from the first number and returns the result.'
};

export { execute, details };
