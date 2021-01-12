import React from 'react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import NavBar from '../components/NavBar';
import Layout from '../components/Layout';
import { Link } from '@chakra-ui/react';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href='/create-post'>
        <Link>Create Post</Link>
      </NextLink>
      <h1>home page</h1>
      <br />
      {!data ? (
        <div>loading</div>
      ) : (
        data.posts.map(p => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
