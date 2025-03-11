const execute = async (base, exponent) => {
  return { result: Math.pow(base, exponent) };
};

const details = {
  type: "function",
  function: {
    name: 'calculatePower',
    parameters: {
      type: 'object',
      properties: {
        base: {
          type: 'number',
          description: 'The base number to be exponentiated'
        },
        exponent: {
          type: 'number',
          description: 'The exponent to which the base number is raised'
        }
      },
      required: ['base', 'exponent']
    },
  },
  description: 'This function calculates the power of a base number raised to an exponent and returns the result.'
};

export { execute, details };
