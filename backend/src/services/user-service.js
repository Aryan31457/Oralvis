import UserRepository from "../repository/user-repository.js";
import jwt from "jsonwebtoken";
import config from '../config/server-config.js'
import tokenBlacklist from "../utils/token-blacklist.js";
import { getNextMemberId } from '../utils/getNextMemberId.js';
import { extractPublicIdFromUrl } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { sendForgotPasswordEmail } from "../utils/mailer.js";
import bcrypt from "bcrypt";
class UserService {
    constructor() {
        this.userrepository = new UserRepository();
    }

    async getAll() {
        try {
            return await this.userrepository.getAll();
        } catch (error) {
            console.log("Error in getAll - UserService");
            throw error;
        }
    }

    async signup(data) {
        try {
            const user = await this.userrepository.findByEmail(data.email);
            if (user) {
                throw new Error("Email has Been registered before");
            }
            data.memberId = await getNextMemberId();
            const user1 = await this.userrepository.createuser(data);
            const payload = {
                id: user1._id,
                email: user1.email,
            };
            const token = jwt.sign(payload, config.JWT_SECRET_KEY, {
                expiresIn: config.JWT_EXPIRY // expires in 7 days
            });
            return { token, user1 };
        } catch (error) {
            console.log(error);
            console.log("Error in signup - UserService");
            throw error;
        }
    }

    async login(data) {
        try {
            const user = await this.userrepository.findByEmail(data.email);
            if (!user) {
                throw new Error("Invalid email");
            }
            const isMatch = await user.comparePassword(data.password);
            if (!isMatch) {
                throw new Error("Invalid password");
            }
            if (user.isverified == false) {
                throw new Error("Email is not verified");
            }
            // Payload you want to store in the token
            const payload = {
                id: user._id,
                email: user.email,
            };

            const token = jwt.sign(payload, config.JWT_SECRET_KEY, {
                expiresIn: config.JWT_EXPIRY // expires in 7 days
            });

            return { token, user };
        } catch (error) {
            console.error("Error in login - UserService:", error);
            console.log("Error in login - UserService");
            throw error;
        }
    }

    async logout(token) {
        try {
            const decoded = jwt.decode(token);
            console.log(decoded);
            if (!decoded || !decoded.exp) {
                throw new Error("Invalid token");
            }

            // Convert exp (seconds) to milliseconds timestamp
            const expiryTimestamp = decoded.exp * 1000;

            // Add token to blacklist
            tokenBlacklist.add(token, expiryTimestamp);

            return true;
        } catch (error) {
            console.log("Error in logout - UserService");
            throw error;
        }
    }

    async getById(id) {
        try {
            const details = await this.userrepository.getById(id);
            return details;
        } catch (error) {
            console.log("Error in getById - UserService");
            throw error;
        }
    }

    async updateUser(id, data) {
        try {
            return await this.userrepository.findByIdandUpdate(id, data);
        } catch (error) {
            console.log("Error in updateUser - UserService");
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const user = await this.userrepository.getById(id);

            // Delete photo if exists
            if (user.photoUrl) {
                const photoPublicId = extractPublicIdFromUrl(user.photoUrl);
                if (photoPublicId) {
                    await cloudinary.uploader.destroy(photoPublicId);
                }
            }

            // Delete signature if exists
            if (user.signatureUrl) {
                const signaturePublicId = extractPublicIdFromUrl(user.signatureUrl);
                if (signaturePublicId) {
                    await cloudinary.uploader.destroy(signaturePublicId);
                }
            }

            // Now delete user from DB
            return await this.userrepository.findByIdandDelete(id);
        } catch (error) {
            console.log("Error in deleteUser - UserService");
            throw error;
        }
    }

    async changePassword(id, data) {
        try {
            const user = await this.userrepository.getById(id);
            if (user.password !== data.oldPassword) {
                throw new Error("Old password does not match");
            }
            return await this.userrepository.findByIdandUpdate(id, { password: data.newPassword });
        } catch (error) {
            console.log("Error in changePassword - UserService");
            throw error;
        }
    }

    async getProfile(id) {
        try {
            return await this.userrepository.getProfile(id);
        } catch (error) {
            console.log("Error in getProfile - UserService");
            throw error;
        }
    }

    async verify(data) {
        try {
            console.log(data);
            const response = await this.userrepository.verify(data);
            console.log(response);
            return response;
        } catch (error) {
            console.log('Something wrong at service level');
            throw error;
        }
    }

    async forgetPassword(email) {
        try {
            const user = await this.userrepository.findByEmail(email);
            if (!user) {
                throw new Error("Could not find email");
            }
            const payload = {
                id: user._id,
                email: user.email,
            };
            const resetToken = jwt.sign(payload, config.JWT_SECRET_KEY, {
                expiresIn: config.FORGET_PASSWORD_EXPIRY // expires in 5 minutes
            });
            const resetLink = `${ config.FRONTEND_URL }/reset-password/${ user._id }/${resetToken}`
            sendForgotPasswordEmail(user.email, resetLink, user.name);
        } catch (error) {
            console.log("Something wrong at service layer");
            throw error;
        }
    }

    async resetPassword(userId, newPassword) {
        try {
            const user = await this.userrepository.getById(userId);
            if (!user) throw new Error("User not found");
            const hashedPassword = await bcrypt.hash(newPassword, 5);
            await this.userrepository.findByIdandUpdate(userId, { password: hashedPassword });
            return { message: "Password reset successful" };
        } catch (error) {
            console.log("Something wrong at service level", error);
            throw error;
        }
    }
}

export default UserService;