import 'reflect-metadata'; // required for typeorm and graphql
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
import { createUserLoader } from './utils/CreateUserLoader';
import { createVoteLoader } from './utils/createVoteLoader';
//r
const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'reddit-clone',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Vote],
  });
  await conn.runMigrations();

  // await Post.delete({})

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: 'http://localhost:3000',
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
      },
      saveUninitialized: false,
      secret: 'randomsecretkey',
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
      voteLoader: createVoteLoader()
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

  app.listen(4000, () => {
    console.log('server started on local host 4000');
  });
};

main().catch(err => {
  console.log(err);
});
