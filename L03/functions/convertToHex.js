const execute = async (number) => {
    const hexExpression = number.toString(16);
    return { result: hexExpression };
};

const details = {
    type: "function",
    function: {
        name: 'convertToHex',
        parameters: {
            type: 'object',
            properties: {
                number: {
                    type: 'number',
                    description: 'The number to convert to its hexadecimal representation.'
                }
            },
            required: ['number']
        },
    },
    description: 'This function converts a given number to its hexadecimal representation and returns it as a string.'
};

export { execute, details };
