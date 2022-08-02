import { Menu } from './Menu';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OpeningHours } from './OpeningHours';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision' })
  cashBalance: number;

  @Column()
  restaurantName: string;

  @OneToMany(() => OpeningHours, (opHour) => opHour.restaurant, { cascade: true })
  openingHours: OpeningHours[];

  @OneToMany(() => Menu, (menu) => menu.restaurant, { cascade: true })
  menu: Menu[];
}
