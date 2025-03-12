const execute = async (numTosses, numTails) => {
    function factorial(n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    function combinations(n, k) {
        return factorial(n) / (factorial(k) * factorial(n - k));
    }

    const probabilityOfTails = 0.5;
    
    const probability = combinations(numTosses, numTails) * 
                        Math.pow(probabilityOfTails, numTails) * 
                        Math.pow(1 - probabilityOfTails, numTosses - numTails);
    
    return { result: probability };
};

const details = {
    type: "function",
    function: {
        name: 'calculateCoinTossProbability',
        parameters: {
            type: 'object',
            properties: {
                numTosses: {
                    type: 'number',
                    description: 'Total number of coin tosses'
                },
                numTails: {
                    type: 'number',
                    description: 'Number of tails to calculate probability for'
                }
            },
            required: ['numTosses', 'numTails']
        },
    },
    description: 'This function calculates the probability of getting a specific number of tails in a given number of coin tosses.'
};

export { execute, details };
