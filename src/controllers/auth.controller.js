import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import redis from '../db/redis.js';
import { publishToQueue } from '../broker/broker.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      fullName: { firstName, lastName },
      role: role || 'user',
      addresses: []
    });

    await Promise.all([
      publishToQueue('AUTH_SELLER_DASHBOARD.USER_CREATED', user),
      publishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
        email: user.email,
        fullName: user.fullName,
      })
    ]);

    const token = jwt.sign({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const conditions = [{ email: identifier }, { username: identifier }];

    const user = await User.findOne({ $or: conditions }).select("+password");

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });


    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  const { firstName, lastName, username } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName.firstName = firstName || user.fullName.firstName;
    user.fullName.lastName = lastName || user.fullName.lastName;
    user.username = username || user.username;

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } 
    return res.status(200).json({
      message: 'User details fetched successfully',
      user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  } 
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    message: 'Current user fetched successfully',
    user: req.user
  });
};

export const addNewAddress = async (req, res) => {

  const { street, city, state, zip, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const newAddress = { street, city, state, zip, country, isDefault: isDefault || false };

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();
    return res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export const UpdateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { street, city, state, zip, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const address = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zip = zip || address.zip;
    address.country = country || address.country;
    await user.save();

    return res.status(200).json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    return res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (req, res) => {

  const token = req.cookies.token;
  redis.set(`blacklisted_${token}`, 'true', 'EX', 24 * 60 * 60);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};
