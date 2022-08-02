import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import fetch from 'node-fetch';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import { incomingRestaurant } from './../entities/restaurants/types';
import { Restaurant } from './../entities/restaurants/Restaurant';
import { Menu } from '../entities/restaurants/Menu';
import { OpeningHours } from '../entities/restaurants/OpeningHours';

const restuarantRepository = getRepository(Restaurant);

const weekTimeExtractor = (openingHourString: string) => {
  let result = [];
  const workingString = openingHourString.toLowerCase();
  workingString.split(' / ').forEach((opHr) => {
    const slotInfo = { name: [], startTime: '', endTime: '' };
    let timeFound = false;
    let colonFound = false;
    let hiphenTime = false;
    let hiphenWeek = false;
    let pmFound = false;
    let startTimeFound = false;
    let tempWeek = '';
    let tempHour = '';
    let tempMin = '';

    for (let i = 0; i < opHr.length; i++) {
      const c = opHr[i];

      if (!timeFound && c.match(/[a-z]/i)) tempWeek += c;
      else if (!timeFound && c == '-') hiphenWeek = true;
      else if (!timeFound && !c.match(/\d+/g) && tempWeek) {
        slotInfo.name.push(tempWeek);
        tempWeek = '';
      } else {
        if (c == ' ') continue;
        timeFound = true;
        if (c == ':') colonFound = true;
        else if (c == '-') hiphenTime = true;
        else if (c == 'p') pmFound = true;

        if (!colonFound && c.match(/\d+/g)) tempHour += c;
        else if (colonFound && c.match(/\d+/g)) tempMin += c;

        if ((c == 'a' || c == 'p') && !startTimeFound) {
          if (pmFound && tempHour != '12') tempHour = `${+tempHour + 12}`;
          else if (pmFound && tempHour == '12') tempHour = tempHour;
          else if (tempHour == '12') tempHour = '00';

          tempMin = tempMin ? tempMin : '00';
          slotInfo.startTime = tempHour + ':' + tempMin;
          startTimeFound = true;
        }

        if (hiphenTime) {
          colonFound = false;
          pmFound = false;
          hiphenTime = false;
          tempHour = '';
          tempMin = '';
        }
      }
    }

    const weekNames = ['sat', 'sun', 'mon', 'tues', 'weds', 'thurs', 'fri'];
    if (hiphenWeek) {
      const length = weekNames.length;
      const startIndex = weekNames.findIndex((el) => el === slotInfo.name[0]);
      let endIndex = weekNames.findIndex((el) => el === slotInfo.name[1]);
      endIndex = endIndex < startIndex ? length + endIndex : endIndex;
      slotInfo.name = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const element = weekNames[((i % length) + length) % length];
        slotInfo.name = [...slotInfo.name, element];
      }
    }

    if (pmFound && tempHour != '12') tempHour = `${+tempHour + 12}`;
    else if (pmFound && tempHour == '12') tempHour = tempHour;
    else if (tempHour == '12') tempHour = '00';

    tempMin = tempMin ? tempMin : '00';
    slotInfo.endTime = tempHour + ':' + tempMin;
    const pushableResult = slotInfo.name.map((name) => ({
      name,
      startTime: slotInfo.startTime,
      endTime: slotInfo.endTime,
    }));
    result = [...result, ...pushableResult];
  });

  return result;
};

const loadMenu = async (menus: any[]) => {
  const menuArray = [];
  menus.forEach((element) => {
    const menu = new Menu();
    menu.dishName = element.dishName;
    menu.price = element.price;

    menuArray.push(menu);
  });

  return menuArray;
};

type opHoursType = {
  name: string;
  startTime: string;
  endTime: string;
};

const loadRestaurant = async () => {
  const remoteJSON = await fetch(
    'https://gist.githubusercontent.com/seahyc/b9ebbe264f8633a1bf167cc6a90d4b57/raw/d11bb933e131d6c5946db31b78e3b96b4dadb959/restaurant_with_menu.json',
  ).then((r) => r.body);

  const pipeline = remoteJSON.pipe(StreamArray.withParser());
  const restaurantsPromise = [];

  pipeline.on('data', async (data) => {
    const restaurantInfo: incomingRestaurant = data.value;

    const menuArray = await loadMenu(restaurantInfo.menu);

    let restaurant = new Restaurant();
    restaurant.restaurantName = restaurantInfo.restaurantName;
    restaurant.cashBalance = restaurantInfo.cashBalance;

    const opHours: opHoursType[] = weekTimeExtractor(restaurantInfo.openingHours);
    const pushableOpeningHours = [];
    opHours.forEach((opHour) => {
      const openingHour = new OpeningHours();
      openingHour.weekName = opHour.name;
      openingHour.startTime = opHour.startTime;
      openingHour.endTime = opHour.endTime;
      pushableOpeningHours.push(openingHour);
    });

    restaurant.openingHours = pushableOpeningHours;
    restaurant.menu = menuArray;

    restaurantsPromise.push(restuarantRepository.save(restaurant));
  });

  await new Promise((r) => {
    pipeline.on('end', r);
    pipeline.on('error', r);
  });

  await Promise.allSettled(restaurantsPromise);
};

export class SeedRestaurant1658822263261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await loadRestaurant();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
