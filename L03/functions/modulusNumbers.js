const execute = async (num1, num2) => {
   // Perform the modulus operation
   const result = num1 % num2;
   // Return the result in an object
   return { result };
};

const details = {
   type: "function",
   function: {
       name: 'modulusNumbers',
       parameters: {
           type: 'object',
           properties: {
               num1: {
                   type: 'number',
                   description: 'The dividend in the modulus operation'
               },
               num2: {
                   type: 'number',
                   description: 'The divisor in the modulus operation'
               }
           },
           required: ['num1', 'num2']
       },
   },
   description: 'This function calculates the modulus of num1 by num2 and returns the remainder.'
};

export { execute, details };
