import { User } from './User';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PurchaseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dishName: string;

  @Column()
  restaurantName: string;

  @Column({ type: 'double precision' })
  transactionAmount: number;

  @Column()
  transactionDate: string;

  @ManyToOne(() => User, (user) => user.purchases)
  user: User;
}
