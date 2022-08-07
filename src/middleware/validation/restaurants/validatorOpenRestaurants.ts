import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';
import validator from 'validator';

export const validatorOpenRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const errorsValidation: ErrorValidation[] = [];
  if (req.query.day) req.query.day = req.query.day.toString().toLocaleLowerCase();
  const { day, time, limit, page } = req.query as { [key: string]: string };
  const price: any = req.query.price;

  const weeks = ['sat', 'sun', 'mon', 'tues', 'weds', 'thurs', 'fri'];
  if (!weeks.includes(day)) {
    errorsValidation.push({ day: 'Day should be valid (sat|sun|mon|tues|weds|thurs|fri)' });
  }
  if (!time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/))
    errorsValidation.push({ time: 'Invalid Time [Expected in ((h)h:mm) format]' });
  if (limit && !validator.isNumeric(limit)) errorsValidation.push({ limit: 'limit should be number' });
  if (page && !validator.isNumeric(page)) errorsValidation.push({ page: 'page should be number' });
  if (price && !price.gte && !price.lte)
    errorsValidation.push({ price: 'It only accepts price[gte] and price[lte] params' });

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'restaurant validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
