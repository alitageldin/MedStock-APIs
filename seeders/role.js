const Role = require('../app/roles/role.model')
const { SA_ROLE_TITLE } = require('../helpers/constants')
const { ROLES } = require('../helpers/hard-coded-roles')

require('dotenv').config()

exports.seedRole = async () => {
  await Role.deleteMany()
  if (ROLES.length > 0) {
    await ROLES.forEach(element=> {
      let role = new Role();
      if(element.title === SA_ROLE_TITLE){
        role = new Role({
          title: SA_ROLE_TITLE,
          description: 'He has all the permissions'
        })
      }else{
        role = new Role({
          title: element.title,
          description: element.description
        })
      }
      role.save()
      
    });
    
  }
}
