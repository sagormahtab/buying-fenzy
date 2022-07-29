import { Menu } from './Menu';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision' })
  cashBalance: number;

  @Column()
  openingHours: string;

  @Column()
  restaurantName: string;

  @OneToMany(() => Menu, (menu) => menu.restaurant, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  menu: Menu[];
}
