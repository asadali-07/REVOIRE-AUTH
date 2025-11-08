import { body, validationResult } from 'express-validator';

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation errors', errors: errors.array() });
  }
  next();
};

export const registerUserValidations = [
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['user', 'seller']).withMessage('Role must be either user or seller'),
  respondWithValidationErrors
];

export const loginUserValidations = [
  body('identifier').notEmpty().withMessage('Identifier is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    if (!req.body.identifier) {
      return res.status(400).json({ message: 'Identifier is required' });
    }
    next();
  },
  respondWithValidationErrors
];

export const addressValidations = [
  body('street').notEmpty().withMessage("Street should not be empty").isString().withMessage("Should be a valid string"),
  body('city').notEmpty().withMessage("City should not be empty").isString().withMessage("Should be a valid string"),
  body('state').notEmpty().withMessage("State should not be empty").isString().withMessage("Should be a valid string"),
  body('zip').notEmpty().withMessage("Zip code should not be empty").matches(/^\d{6}$/).withMessage("Zip code must be exactly 6 digits"),
  body('country').notEmpty().withMessage("Country should not be empty").isString().withMessage("Should be a valid string"),
  body('isDefault').optional().isBoolean().withMessage("Should be a valid boolean"),
  respondWithValidationErrors
]


