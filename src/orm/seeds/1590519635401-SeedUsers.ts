import { MigrationInterface, QueryRunner, getRepository, createQueryBuilder } from 'typeorm';
import fetch from 'node-fetch';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import { incomingUser } from './../entities/users/types';
import { Role } from '../entities/users/types';
import { User } from '../entities/users/User';
import { PurchaseHistory } from '../entities/users/PurchaseHistory';

const userRepository = getRepository(User);

const loadUsers = async () => {
  const remoteJSON = await fetch(
    'https://gist.githubusercontent.com/seahyc/de33162db680c3d595e955752178d57d/raw/8d0310dde9e783b9ec8d7fbdf9bffe06fe627956/users_with_purchase_history.json',
  ).then((r) => r.body);

  const pipeline = remoteJSON.pipe(StreamArray.withParser());
  let count = 0;
  const usersPromise = [];

  pipeline.on('data', async (data) => {
    const userInfo: incomingUser = data.value;

    const purchasesArray = [];
    userInfo.purchaseHistory.forEach((element) => {
      const purchase = new PurchaseHistory();
      purchase.dishName = element.dishName;
      purchase.restaurantName = element.restaurantName;
      purchase.transactionAmount = element.transactionAmount;
      purchase.transactionDate = element.transactionDate;

      purchasesArray.push(purchase);
    });

    const innerCount = ++count;
    let user = new User();
    const names = userInfo.name.split(' ');
    user.name = userInfo.name;
    user.username = names[0].toLocaleLowerCase() + names[1].toLowerCase() + innerCount;
    user.email = `${names[0].toLowerCase()}-${innerCount}@${names[1] ? names[1].toLowerCase() : 'test'}.com`;
    user.cashBalance = userInfo.cashBalance;
    user.password = 'test1234';
    user.hashPassword();
    user.role = 'STANDARD' as Role;
    user.purchases = purchasesArray;

    usersPromise.push(userRepository.save(user));
  });

  await new Promise((r) => {
    pipeline.on('end', r);
    pipeline.on('error', r);
  });

  await Promise.allSettled(usersPromise);
};

export class SeedUsers1590519635401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await loadUsers();

    // setting a new admin
    let user = new User();
    user.name = 'Shekra Guy';
    user.username = 'shekraguy';
    user.email = 'shekra@guy.com';
    user.cashBalance = 2.03;
    user.password = 'test1234';
    user.hashPassword();
    user.role = 'ADMINISTRATOR' as Role;
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    console.log('Not implemented');
    await createQueryBuilder().delete().from(User).execute();
  }
}
