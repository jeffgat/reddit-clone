import { MyContext } from 'src/types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // read
  @Query(() => Post, { nullable: true })
  post(
    // arg is what the query will be called (id), typescript type follows
    @Arg('id') id: number,
    // context is my mikro orm shit
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    // do stuff here
    return em.findOne(Post, { id });
  }

  // create
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // update
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,

    // the @Arg type must be set (() => String) here to pass nullable in
    // also the @Arg type is usually inferred, but if not, just pass it in as a 2nd param to Arg
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  // delete
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
