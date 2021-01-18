import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

import { createUrqlClient } from '../utils/createUrqlClient';
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../generated/graphql';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import VoteSection from '../components/VoteSection';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>query failed bud</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
        <div>loading</div>
      ) : (
        <Stack spacing={8}>
          {/* the ternary IF NULL here is because cache.invalidate (createUrqlClient) makes posts null */}
          {data!.posts.posts.map(p =>
            !p ? null : (
              <Flex key={p.id} p={4} shadow='sm' borderWidth='1px'>
                <VoteSection post={p} />
                <Box flex={1}>
                  <NextLink href='/post/[id]' as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize='xl'>{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text fontSize='sm' mt={1}>
                    Posted by {p.creator.username}
                  </Text>
                  <Flex align='center'>
                    <Text flex={1} mt={2}>{`${p.textSnippet}...`}</Text>
                    {meData?.me?.id !== p.creator.id ? null : (<Box ml='auto'>
                      <NextLink
                        href='/post/edit/[id]'
                        as={`/post/edit/${p.id}`}
                      >
                        <IconButton
                          mr={2}
                          icon={<EditIcon />}
                          aria-label='Edit post'
                          size='sm'
                          onClick={() => {
                            deletePost({ id: p.id });
                          }}
                        />
                      </NextLink>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label='Delete post'
                        size='sm'
                        onClick={() => {
                          deletePost({ id: p.id });
                        }}
                      />
                    </Box>)}
                  </Flex>
                </Box>
              </Flex>
            )
          )}
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
