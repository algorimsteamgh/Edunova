import { BadRequestError } from '../utils/errors.js';

export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new BadRequestError('Request validation failed', formattedErrors, 'VALIDATION_FAILED'));
      }
      next(err);
    }
  };
}
