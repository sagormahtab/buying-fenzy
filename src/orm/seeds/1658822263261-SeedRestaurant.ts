import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import fetch from 'node-fetch';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import { incomingRestaurant } from './../entities/restaurants/types';
import { Restaurant } from './../entities/restaurants/Restaurant';
import { Menu } from '../entities/restaurants/Menu';

export class SeedRestaurant1658822263261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const restuarantRepository = getRepository(Restaurant);

    const remoteJSON = await fetch(
      'https://gist.githubusercontent.com/seahyc/b9ebbe264f8633a1bf167cc6a90d4b57/raw/d11bb933e131d6c5946db31b78e3b96b4dadb959/restaurant_with_menu.json',
    ).then((r) => r.body);

    const pipeline = remoteJSON.pipe(StreamArray.withParser());

    pipeline.on('data', async (data) => {
      let restaurant = new Restaurant();
      const restaurantInfo: incomingRestaurant = data.value;
      restaurant.restaurantName = restaurantInfo.restaurantName;
      restaurant.cashBalance = restaurantInfo.cashBalance;
      restaurant.openingHours = restaurantInfo.openingHours;

      await restuarantRepository.save(restaurant);

      const menuPromise = restaurantInfo.menu.map((element) => {
        const menu = new Menu();
        const menuRepository = getRepository(Menu);
        menu.dishName = element.dishName;
        menu.price = element.price;
        menu.restaurant = restaurant;

        return menuRepository.save(menu);
      });

      await Promise.allSettled(menuPromise);
    });

    await new Promise((r) => {
      pipeline.on('end', r);
      pipeline.on('error', r);
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
