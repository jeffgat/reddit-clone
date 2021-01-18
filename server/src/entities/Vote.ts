import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity()
export class Vote extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, user => user.votes)
  user: User;

  @PrimaryColumn()
  postId: number;

  // cascade delete, when a post is deleted, the associated votes will be deleted as well
  // @ManyToOne(() => Post, post => post.votes, {
  //   onDelete: "CASCADE",
  // })
  post: Post;
}
