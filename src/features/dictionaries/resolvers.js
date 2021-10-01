const dictionaryResolvers = {
  Query: {
    typeList: async (_parent, _args, { dataSources }, _info) => {
      const typeList = await dataSources.dictionaryDb.getTypeList()
      return typeList
    },
    categoryList: async (_parent, _args, { dataSources }, _info) => {
      const categoryList = await dataSources.dictionaryDb.getCategoryList()
      return categoryList
    },
    countryList: async (_parent, _args, { dataSources }, _info) => {
      const countryList = await dataSources.dictionaryDb.getCountryList()
      return countryList
    },
    countyList: async (_parent, _args, { dataSources }, _info) => {
      const countyList = await dataSources.dictionaryDb.getCountyList()
      return countyList
    },
    cityList: async (_parent, _args, { dataSources }, _info) => {
      const cityList = await dataSources.dictionaryDb.getCityList()
      return cityList
    }
  }
}

module.exports = dictionaryResolvers
