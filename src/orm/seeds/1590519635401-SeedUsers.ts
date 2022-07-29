import { MigrationInterface, QueryRunner, getRepository, createQueryBuilder } from 'typeorm';
import fetch from 'node-fetch';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import { incomingUser } from './../entities/users/types';
import { Role } from '../entities/users/types';
import { User } from '../entities/users/User';
import { PurchaseHistory } from '../entities/users/PurchaseHistory';
export class SeedUsers1590519635401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const userRepository = getRepository(User);

    const remoteJSON = await fetch(
      'https://gist.githubusercontent.com/seahyc/de33162db680c3d595e955752178d57d/raw/8d0310dde9e783b9ec8d7fbdf9bffe06fe627956/users_with_purchase_history.json',
    ).then((r) => r.body);

    const pipeline = remoteJSON.pipe(StreamArray.withParser());
    let count = 0;

    pipeline.on('data', async (data) => {
      let user = new User();
      const userInfo: incomingUser = data.value;
      const names = userInfo.name.split(' ');
      user.name = userInfo.name;
      user.username = names[0].toLocaleLowerCase() + names[1].toLowerCase() + ++count;
      user.email = `${names[0].toLowerCase()}@${names[1] ? names[1].toLowerCase() : 'test'}-${++count}.com`;
      user.cashBalance = userInfo.cashBalance;
      user.password = 'test1234';
      user.hashPassword();
      user.role = 'STANDARD' as Role;

      await userRepository.save(user);

      const purchasePromise = userInfo.purchaseHistory.map((element) => {
        const purchase = new PurchaseHistory();
        const purchaseRepository = getRepository(PurchaseHistory);
        purchase.dishName = element.dishName;
        purchase.restaurantName = element.restaurantName;
        purchase.transactionAmount = element.transactionAmount;
        purchase.transactionDate = element.transactionDate;
        purchase.user = user;

        return purchaseRepository.save(purchase);
      });

      await Promise.allSettled(purchasePromise);
    });

    await new Promise((r) => {
      pipeline.on('end', r);
      pipeline.on('error', r);
    });

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
