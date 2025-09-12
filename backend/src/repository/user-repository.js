import CrudRepository from "./crud-repository.js";
import User from '../models/User.js'
import { sendEmail } from "../utils/mailer.js";

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async createuser(data) {
        try {
            console.time("data received");
            const verificationcode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

            const dataWithOtp = {
                ...data,
                verificationcode,
                verificationCodeExpiresAt: expiresAt
            };

            const newUser = await User.create(dataWithOtp);

            sendEmail(
                newUser.email,
                'Email Verification - Action Required',
                `Hi ${newUser.name},

                Thank you for registering with us!

                Please use the verification code below to verify your email address. This helps us ensure the security of your account.

                Verification Code: ${verificationcode}

                Note: This code is valid for only 10 minutes.

                If you did not initiate this request, please ignore this email.

                Best regards,  
                InfinitoArchery`
            );

            console.timeEnd("data received")
            return newUser;
        } catch (error) {
            console.log('something wrong at repo level');
            throw error;
        }
    }
    async findByEmail(data) {
        try {
            const user = await User.findOne({ email: data });
            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async verify(data) {
        try {
            console.log(data.verificationcode);
            const user = await User.findOne({
                verificationcode: data.verificationcode
            });

            // If no user found or OTP doesn't match
            if (!user) throw new Error("Invalid verification code");

            // Check if OTP is expired
            if (!user.verificationCodeExpiresAt || Date.now() > user.verificationCodeExpiresAt.getTime()) {
                throw new Error("Verification code has expired");
            }

            // Mark user as verified
            user.isverified = true;
            user.verificationcode = null;
            user.verificationCodeExpiresAt = null;

            await user.save();

            return user;

        } catch (error) {
            throw error;
        }
    }



}
export default UserRepository;