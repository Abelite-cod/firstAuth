const User = require("../models/user.schema");
const bcrypt = require('bcryptjs');
const saltRounds = 10;


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
        return res.status(201).json({message: 'User Created Succesfully', newUser})
    }catch(error){
        console.error('Error creating user:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

// update user
const updateUser = async (req, res) => {
    const {userID} = req.params;
    const {name, email, password} = req.body;
    // Validate Inputs
    if(!name && !email && !password){
        return res.status(400).json({message: 'At least one field is required to update'});
    }
    try{
        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        // Check if password is provided and hash it
        let hashedPassword;
        const updateUser = {};
        if(password){
            if(password.length < 6){
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            hashedPassword = await bcrypt.hash(password, saltRounds);
            updateUser.password = hashedPassword;
        }
        if(name){
            updateUser.name = name;
        }
        if(email){
            // Check if email already exists
            const existingUser = await User.findOne({ email, _id: { $ne: userID } });
            if (!existingUser) {
                updateUser.email = email;
            } else {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        // Update user details
        const updatedUser = await User.findByIdAndUpdate(userID, updateUser, {new: true});
        return res.status(200).json({message: 'User Updated Successfully', updatedUser});
    } catch(error){
        console.error('Error updating user:', error);
        return res.status(500).json({message: 'Internal Server Error', error});
    }
}


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
        return res.status(200).json({message: 'User Logged In Successfully', user})
    }catch(error){
        return res.status(500).json({message: "Internal Server Error", error})
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

module.exports = {
    signup,
    login,
    updateUser,
    makeAdmin
}