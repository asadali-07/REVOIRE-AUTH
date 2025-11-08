import { Router } from 'express';
import { register,login, logout, getCurrentUser, addNewAddress, deleteAddress,UpdateAddress,updateUser,getUserDetails } from '../controllers/auth.controller.js';
import { registerUserValidations, loginUserValidations, addressValidations } from '../middlewares/validator.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';


const router = Router();

router.post('/register', registerUserValidations, register);
router.post('/login', loginUserValidations, login);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/users/me', authMiddleware, getUserDetails);
router.patch('/users/me', authMiddleware, updateUser);
router.post('/users/me/addresses', authMiddleware, addressValidations, addNewAddress);
router.patch('/users/me/addresses/:addressId', authMiddleware, UpdateAddress);
router.delete('/users/me/addresses/:addressId', authMiddleware, deleteAddress);
router.get('/logout', authMiddleware, logout);

export default router;
