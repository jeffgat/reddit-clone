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
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Vote } from '../entities/Vote';

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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isVote = value !== -1;
    const realValue = isVote ? 1 : -1;
    const { userId } = req.session;

    const vote = await Vote.findOne({ where: { postId, userId } });

    // user has voted on post before
    // and are changing vote
    if (vote && vote.value !== realValue) {
      await getConnection().transaction(async tm => {
        await tm.query(
          `
          update vote
          set value = $1
          where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );
        await tm.query(
          `
          update post 
          set points = points + $1 
          where id = $2
        `,
          [2 * realValue, postId] // to negative the +1 or -1 if you change your vote
        );
      });
    } else if (!vote) {
      // has never voted before
      getConnection().transaction(async tm => {
        await tm.query(
          `
          insert into vote ("userId", "postId", value) 
          values ($1,$2,$3);
        `,
          [userId, postId, realValue]
        );
        await tm.query(
          `
          update post 
          set points = points + $1 
          where id = $2
        `,
          [realValue, postId]
        );
      });
    }
    // await Vote.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    // setting a stop point here by grabbing 1 more post than the actual amount requested
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }
    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt"
        ) creator, 
      ${
        req.session.userId
          ? '(select value from vote where "userId" = $2 and "postId" = p.id) "voteStatus"'
          : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ''}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   // joining creator to user
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   // postgres required DOUBLEQUOTES here for the selector
    //   .orderBy('p."createdAt"', 'DESC')
    //   // use take instead of limit for pagination
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    // }

    // const posts = await qb.getMany();

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
    @Arg('id', () => Int) id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ['creator'] });
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
    // the @Arg type must be set (() => String) here to pass nullable in
    // also the @Arg type is usually inferred, but if not, just pass it in as a 2nd param to Arg
    @Arg('title') title: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    // const post = await Post.findOne( where: { id })
    // syntax above is longer form version of one below

    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();
    console.log(result);
    return result.raw[0];
  }

  // delete
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // need to delete from "vote" before deleting post because they are sharing data

    // non cascade way
    // ================================================
    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorized');
    }
    await Vote.delete({ postId: id });
    await Post.delete({ id });

    await Post.delete({ id, creatorId: req.session.Id });
    return true;
  }
}
