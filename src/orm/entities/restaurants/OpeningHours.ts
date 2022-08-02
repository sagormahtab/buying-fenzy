import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './Restaurant';

@Entity()
export class OpeningHours {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  weekName: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.openingHours)
  restaurant: Restaurant;
}
