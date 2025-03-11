const execute = async (num1, num2) => {
    const gcd = (a, b) => {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };
    return { result: gcd(num1, num2) };
};

const details = {
    type: "function",
    function: {
        name: 'findGreatestCommonDivisor',
        parameters: {
            type: 'object',
            properties: {
                num1: {
                    type: 'number',
                    description: 'The first number to find the GCD for.'
                },
                num2: {
                    type: 'number',
                    description: 'The second number to find the GCD for.'
                }
            },
            required: ['num1', 'num2']
        },
    },
    description: 'This function finds the greatest common divisor (GCD) of two numbers and returns the result.'
};

export { execute, details };
