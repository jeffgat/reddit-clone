import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { getConnection } from 'typeorm';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 80);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    // setting a stop point here by grabbing 1 more post than the actual amount requested
    const realLimitPlusOne = realLimit + 1;

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')

      // postgres required DOUBLEQUOTES here for the selector
      .orderBy('"createdAt"', 'DESC')

      // use take instead of limit for pagination
      .take(realLimitPlusOne);

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    const posts = await qb.getMany();

    return {
      // slicing that extra 1 post off of the actualy requested amount
      posts: posts.slice(0, realLimit),
      // if posts.length is this limit + 1, we have more, if it's under than we're on our last page
      hasMore: posts.length === realLimitPlusOne,
    };
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
