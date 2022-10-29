import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "text", nullable: false })
  carModel: string;

  @Field()
  @Column({ type: "text", nullable: false })
  imageId: string;

  @Field(() => Int)
  @Column({ nullable: false })
  numberOfSeats: number;

  @Field()
  @Column({ nullable: false })
  isAcWorking: boolean;

  @Field(() => String)
  @Column({ type: "text", nullable: false })
  locations: string;

  @Field(() => Int)
  @Column({ type: "text", nullable: false })
  price: number;

  @Field()
  @Column({ nullable: false })
  departure: string;

  @Field()
  @Column({ nullable: false })
  arrival: string;

  @Field(() => String)
  @Column({ nullable: false })
  days: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.post)
  @JoinColumn()
  user: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
