import { CustomError } from 'utils/response/custom-error/CustomError';
import { Restaurant } from './../../orm/entities/restaurants/Restaurant';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const restaurantRepository = getRepository(Restaurant);
  try {
    const restaurants = await restaurantRepository.find({
      relations: ['menu'],
    });
    res.customSuccess(200, 'List of restaurants', restaurants);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of restaurants`, null, err);
  }
};
