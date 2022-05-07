const userDataLayer = require('../dal/users')

class UserServices {
    constructor(){
        // this.user_id = user_id;
    }

    async getUser(user_id){
        return await userDataLayer.getUserById(user_id);
    }

    async getUserByEmail(user_email){
        return await userDataLayer.getUserByEmail(user_email);
    }
}

module.exports = UserServices;