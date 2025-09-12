import express from "express";
const router = express.Router();
import Usercontroller from "../controller/user-controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
// Create (Register)
router.post('/signup', userUpload, Usercontroller.signup);

// Read (All users)
router.get('/getall', Usercontroller.getAll);

// Read (Single user by ID)
router.get('/getById', isAuthenticated, Usercontroller.getById);

// Update (user by ID)
router.put('/update', isAuthenticated, Usercontroller.updateUser);

// Delete (user by ID)   //for admin 
router.delete('/delete', isAdmin, Usercontroller.deleteUser);

// Login (auth)
router.post('/login', Usercontroller.login);

// Optional: Logout
router.post('/logout', Usercontroller.logout);

// Optional: Change password
router.post('/change-password', isAuthenticated, Usercontroller.changePassword);

// verify (email) by sending otp
router.post('/verifyemail', Usercontroller.verifyemail);

router.post('/contact', isAuthenticated, ContactController.createcontact)

router.get('/contact', ContactController.getAllContacts);

//Forget Password
router.post("/forget-password", Usercontroller.forgetPassword);

router.post("/forget-password/:id/:token", verifyResetToken, Usercontroller.forgetPasswordEmail);

export default router