import { Field, Int, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
} from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true, type: "text" })
  email!: string;

  @Field()
  @Column({ nullable: false, type: "boolean", default: false })
  confirmed: boolean;

  @Field()
  @Column({ nullable: true })
  name: string;

  @Field()
  @Column({ nullable: true, default: "University Of Khartoum" })
  uni: string;

  @Field()
  @Column({ nullable: true })
  college: string;

  @Field()
  @Column({ nullable: true })
  dep: string;

  @Field()
  @Column({ nullable: true })
  batch: string;

  @Field()
  @Column({ nullable: true })
  address: string;

  @Field()
  @Column({ nullable: true })
  mobile: string;

  @Field()
  @Column({ nullable: true })
  gender: string;

  @Column({ type: "text" })
  password!: string;

  @Field(() => Post, { nullable: true })
  @OneToOne(() => Post, (post) => post.user)
  post?: Post;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
