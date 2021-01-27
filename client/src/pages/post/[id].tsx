import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Button, Heading, Link, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

interface Props {}

const Post = (props: Props) => {
  const [{ data, fetching }] = useGetPostFromUrl();
  const router = useRouter();

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
        <Button
          as={Link}
          fontWeight='medium'
          variant='solid'
          ml='auto'
          mb='6'
          leftIcon={<ArrowBackIcon w={3} h={3} />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Heading mb={4}>{data.post.title}</Heading>
        <Text>{data.post.text}</Text>
      </Box>
      <EditDeletePostButtons
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
