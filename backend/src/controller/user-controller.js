import UserService from "../services/user-service.js";

const userservice = new UserService();
const getAll = async (req, res) => {
    try {
        const users = await userservice.getAll();
        return res.status(200).json({
            users,
            success: true
        })
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const signup = async (req, res) => {
    try {
        const { body } = req;
        const user = await userservice.signup({
            ...body,
        });
        return res.status(200).json({
            data: user,
            success: true,
        })
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: false
        })
    }
}

const login = async (req, res) => {
    try {
        const { token, user } = await userservice.login(req.body);
        return res.status(200).json({
            message: "Login successful",
            token,
            user,
            success: true
        });
    } catch (error) {
        return res.status(401).json({
            message: error.message,
            success: false
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(400).json({ message: "Authorization header missing", success: false });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(400).json({ message: "Token missing", success: false });
        }

        const result = await userservice.logout(token);
        return res.status(200).json({
            success: true,
            result
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

// Get user by ID
const getById = async (req, res) => {
    try {
        const user = await userservice.getById(req.user.id);
        return res.status(200).json({
            data: user,
            success: true
        });
    } catch (error) {
        return res.status(404).json({
            message: error.message,
            success: false
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        console.log(req.body);
        const user = await userservice.updateUser(req.user.id, req.body);
        return res.status(200).json({
            data: user,
            success: true
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: false
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        await userservice.deleteUser(req.user.id);
        return res.status(200).json({
            message: "User deleted",
            success: true
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: false
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        await userservice.changePassword(req.user.id, req.body);
        return res.status(200).json({
            message: "Password updated",
            success: true
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: false
        });
    }
};


const verifyemail = async (req, res) => {
    try {
        const response = await userservice.verify(req.body);
        if (!response) {
            return res.status(401).json({
                success: false,
                message: "Email verification failed",
            })
        }
        return res.status(201).json({
            success: true,
            message: "Email verified successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Error verifying email",
            success: false,
            err: error
        })
    }
}


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const user = await userservice.forgetPassword(email);
            return res.status(200).json({
                data: user,
                sucess: true
            })
        }
        else {
            return res.status(400).json({
                message: "email is required"
            })
        }
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}

const forgetPasswordEmail = async (req, res) => {
    try {
        const userId = req.userFromToken.id; // comes from middleware
        const newPassword = req.body.newPassword;

        const result = await userservice.resetPassword(userId, newPassword);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const Usercontroller = {
    signup,
    login,
    logout,
    getAll,
    getById,
    updateUser,
    deleteUser,
    changePassword,
    verifyemail,
    forgetPassword,
    forgetPasswordEmail
}

export default Usercontroller;