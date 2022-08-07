import { CustomError } from 'utils/response/custom-error/CustomError';
import { Restaurant } from './../../orm/entities/restaurants/Restaurant';
import { NextFunction, Request, Response } from 'express';
import { Brackets, getRepository } from 'typeorm';

type ReqQuery = {
  day?: string;
  time?: string;
  q?: string;
  limit?: string;
  page?: string;
  price?: {
    gte: string;
    lte: string;
  };
};

type RequestType = Request<undefined, undefined, undefined, ReqQuery>;

export const list = async (req: RequestType, res: Response, next: NextFunction) => {
  const restaurantRepository = getRepository(Restaurant);
  let { day, time, q } = req.query;
  const page = req.query.page ? +req.query.page : 1;
  const limit = req.query.limit ? +req.query.limit : 10;
  const price = req.query.price;

  const whereResolver = (query: any, andWhereFlag: boolean, innerQuery: string, params: object) => {
    query = andWhereFlag
      ? query.andWhere(
          new Brackets((qb) => {
            qb.where(innerQuery, params);
          }),
        )
      : query.where(innerQuery, params);

    return query;
  };

  try {
    let andWhereFlag = false;
    let query = restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.menu', 'menu')
      .leftJoinAndSelect('restaurant.openingHours', 'openingHours');
    if (q) {
      query = query.where('(restaurant.restaurantName ILIKE :q OR menu.dishName ILIKE :q)', { q: `%${q}%` });
      andWhereFlag = true;
    }
    if (day) {
      query = whereResolver(query, andWhereFlag, 'openingHours.weekName = :day', {
        day: day.toLowerCase(),
      });

      andWhereFlag = true;
    }
    if (time) {
      query = whereResolver(query, andWhereFlag, ':time BETWEEN openingHours.startTime AND openingHours.endTime', {
        time: '11:15',
      });
      andWhereFlag = true;
    }
    if (price) {
      query = whereResolver(query, andWhereFlag, 'menu.price >= :gte AND menu.price <= :lte', {
        gte: +price.gte,
        lte: +price.lte,
      }).orderBy('restaurant.restaurantName', 'ASC');
    }

    const [restaurants, totalCount] = await query
      .take(+limit)
      .skip((+page - 1) * limit)
      .getManyAndCount();

    res.customSuccess(200, 'List of restaurants', {
      totalCount,
      page,
      dataCount: restaurants.length,
      data: restaurants,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', err.message, null, err);
    return next(customError);
  }
};
