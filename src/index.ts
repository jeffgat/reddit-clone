import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  // setting up schema and resolvers for graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    // accessible by all resolvers
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

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
