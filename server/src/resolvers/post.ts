import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';

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
  async createPost(@Arg('title') title: string): Promise<Post> {
    // 2 sql queries
    return Post.create({ title }).save();
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
