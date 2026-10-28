import { authService } from './service.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(_req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async me(req, res, next) {
    try {
      const user = authService.getCurrentUser(req.user.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
