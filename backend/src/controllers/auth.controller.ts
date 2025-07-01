import { asyncHandler } from "../utils/asynHandler";

const signUp = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
}) 


const signIn = asyncHandler(async (req, res) => {

})

export { signUp, signIn };