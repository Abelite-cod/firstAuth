const User = require("../models/user.schema");
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const signup = async (req, res)=> {
    const{name, email, password} = req.body;
    // Validate input
    if(!name || !email || !password){
        return res.status(400).json({message: 'All fields are required'});
    }

console.log(password.length)
if(password.length < 6){
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
}
    try{
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create new user
        const newUser = new User({ 
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        // create payload for JWT
        const payLoad = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});

        return res.status(201).json({message: 'User Created Succesfully', token})
    }catch(error){
        console.error('Error creating user:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

// update user
// const updateUser = async (req, res) => {
//     const {userID} = req.params;
//     const {name, email, password} = req.body;
//     // Validate Inputs
//     if(!name && !email && !password){
//         return res.status(400).json({message: 'At least one field is required to update'});
//     }
//     try{
//         const user = await User.findById(userID);
//         if(!user){
//             return res.status(404).json({message: 'User not found'});
//         }
//         // Check if password is provided and hash it
//         let hashedPassword;
//         const updateUser = {};
//         if(password){
//             if(password.length < 6){
//                 return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//             }
//             hashedPassword = await bcrypt.hash(password, saltRounds);
//             updateUser.password = hashedPassword;
//         }
//         if(name){
//             updateUser.name = name;
//         }
//         if(email){
//             // Check if email already exists
//             const existingUser = await User.findOne({ email, _id: { $ne: userID } });
//             if (!existingUser) {
//                 updateUser.email = email;
//             } else {
//                 return res.status(400).json({ message: 'Email already in use' });
//             }
//         }
//         // Update user details
//         const updatedUser = await User.findByIdAndUpdate(userID, updateUser, {new: true});
//         return res.status(200).json({message: 'User Updated Successfully', updatedUser});
//     } catch(error){
//         console.error('Error updating user:', error);
//         return res.status(500).json({message: 'Internal Server Error', error});
//     }
// }


// login user
const login = async (req, res)=> {
    const {email, password} = req.body;
    // Validate Inputs
    if(!email || !password){
        return res.status(400).json({message: 'All fields are required'});
    }
    try{
        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        // compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        return res.status(200).json({ message: 'User Logged In Successfully', user, token });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

// up

const makeAdmin = async (req, res) => {
    const{ userId } = req.params;
    try{
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({message: "User not found"});
        }
        user.isAdmin = true;
        await user.save();
        return res.status(200).json({message: 'user promoted to admin successfully', user});
    } catch (error) {
        res.status(500).json({message: 'internal server error', error});
    }
}

// forget password
const forgetPassword = async (req, res) => {
     const { email } = req.body;
    // Validate input
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send email with reset link (pseudo code)
        await sendEmail({
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        });
        return res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// reset password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    // Validate input
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//verify otp
const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    // Validate input
    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }
    try {
        // Verify OTP logic (pseudo code)
        const isValidOtp = await checkOtp(otp); // Implement checkOtp function
        if (!isValidOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    signup,
    login,
    resetPassword,
    verifyOtp,
    makeAdmin
}