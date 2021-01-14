import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 40,
    cursor: null as null | string,
  });
  const [{ data, fetching, ...other }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>query failed bud</div>;
  }

  return (
    <Layout>
      <Flex align='center'>
        <Heading>Reddit 2</Heading>
        <NextLink href='/create-post'>
          <Link fontWeight='medium' color='blue.700' ml='auto'>
            <AddIcon w={3} h={3} mr={2} />
            Create Post
          </Link>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map(p => (
            <Box key={p.id} p={4} shadow='sm' borderWidth='1px'>
              <Heading fontSize='xl'>{p.title}</Heading>
              <Text mt={4}>{`${p.textSnippet}...`}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button 
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                // data.posts' length -1 cause of indexing, then the time created at, is selecting everything AFTER the last item in data.posts
              });
            }}
            colorScheme='blue'
            color='white'
            m='auto'
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
