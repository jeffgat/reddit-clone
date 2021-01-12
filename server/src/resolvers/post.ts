import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  // read
  @Query(() => Post, { nullable: true })
  post(
    // arg is what the query will be called (id), typescript type follows
    @Arg('id') id: number
  ): Promise<Post | undefined> {
    // do stuff here
    return Post.findOne(id);
  }

  // create
  @Mutation(() => Post)
  @UseMiddleware(isAuth) // checking if user is logged in
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // 2 sql queries
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  // update
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,

    // the @Arg type must be set (() => String) here to pass nullable in
    // also the @Arg type is usually inferred, but if not, just pass it in as a 2nd param to Arg
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    // const post = await Post.findOne( where: { id })
    // syntax above is longer form version of one below
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      // 2 sql queries
      await Post.update({ id }, { title });
    }

    return post;
  }

  // delete
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
