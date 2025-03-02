import express from 'express';
import { loginUser,registerUser,adminLogin,fetchAllUsers,deleteUser,addUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/users',fetchAllUsers)
userRouter.post('/delete',deleteUser)
userRouter.post('/add',addUser)

export default userRouter;