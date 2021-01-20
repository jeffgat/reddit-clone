import 'reflect-metadata'; // required for typeorm and graphql
import 'dotenv-safe/config';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';
import { createConnection } from 'typeorm';

import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import { User } from './entities/User';
import { Post } from './entities/Post';
import path from 'path';
import { Vote } from './entities/Vote';
import { createUserLoader } from './utils/createUserLoader';
import { createVoteLoader } from './utils/createVoteLoader';
//r
const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    // synchronize: true, // don't want this to be true in prod
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Vote],
  });
  await conn.runMigrations();

  // await Post.delete({})

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  // need to tell express we have a proxy sitting in front
  // this way cookies and sessions work
  app.set('trust proxy', 1)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    // stuff is tied to this cookie here, am passing it to the nextjs server in createUrqlClient, which is then passed to the graphql api
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true, // can't access cookie in front-end
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? '.jeff-apps.com' : undefined
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  // setting up schema and resolvers for graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // accessible by all resolvers
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // if you ignore a variable you make it an underscore, (in this case the req in (req, res))
  app.get('/', (_, res) => {
    res.send('hello');
  });

  // creating, inserting, finding posts on postgres db via mikro-orm
  // const post = orm.em.create(Post, { title: 'my first post' });
  // await orm.em.persistAndFlush(post);
  // const posts = await orm.em.find(Post, {});

  app.listen(parseInt(process.env.PORT), () => {
    console.log('server started on localhost:4000');
  });
};

main().catch(err => {
  console.log(err);
});
