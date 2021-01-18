import { Box, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { usePostQuery, usePostsQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

interface Props {}

const Post = (props: Props) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (fetching) {
    <Box>loading...</Box>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box mb={2}>
        <Heading mb={4}>{data.post.title}</Heading>
        <Text>{data.post.text}</Text>
      </Box>
      <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id}/>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
