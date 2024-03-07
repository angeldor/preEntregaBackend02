import Users from "../models/user.model.js"
import bcrypt from 'bcrypt'

class UsersDAO {

    static async getUserByEmail(email) {
        return await Users.findOne({ email })
    }

    static async getUserByCreds(email, password) {
        const user = await Users.findOne({ email })
        if (!user) {
            return null
        }

        const passwordMatch = await bcryp.compare(password, user.password)
        if (!passwordMatch) {
            return null
        }

        return user
    }

    static async insert(first_name, last_name, age, email, password) {
        return await new Users({ first_name, last_name, age, email, password }).save()
    }

    static async getUserByID(id) {
        return await Users.findOne({ _id: id }, { first_name: 1, last_name: 1, age: 1, email: 1 }).lean()
    }

    static async insert(first_name, last_name, age, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        return await new Users({ first_name, last_name, age, email, password: hashedPassword }).save()
    }

}

export default UsersDAO;