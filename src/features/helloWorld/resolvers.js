const helloWorldResolvers = {
  Query: {
    myFirstEndpoint: async (_parent, _arguments, _context, _info) => {
      return 'BRUUUUUUUUUUUH🤦‍♂️'
    }
  }
}

module.exports = helloWorldResolvers
