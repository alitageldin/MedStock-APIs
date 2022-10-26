const categoryModel = require('../app/categories/category.model')
const { CATEGORIES } = require('../helpers/hard-coded-categories')

require('dotenv').config()

exports.cateogry = async () => {
  await categoryModel.deleteMany()
  if (CATEGORIES.length > 0) {
    await CATEGORIES.forEach(element=> {
      let category = new categoryModel({
        title: element.title,
        description: element.description
      })
      category.save()
    });
    
  }
}
