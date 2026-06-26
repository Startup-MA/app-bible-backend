import userDAO from "../dao/user.js"

async function addNewClient(message) {
    try {

        console.log(message)
        // await userDAO.updatePassword(
        //     message["message"]["uuid"],
        //     message["message"]["new_password"] 
        // )
    } catch (err) {
        console.error("Error occured during new password setting transaction: \n", err)
        throw err
    }
    
    console.log("New password was set!")
}

export default addNewClient