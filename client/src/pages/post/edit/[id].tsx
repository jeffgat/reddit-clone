import { Box, Button, Heading } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import {
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Box>Loading..</Box>;
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
      <Heading>Edit Post</Heading>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async values => {
          await updatePost({ id: intId, ...values });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField name='title' placeholder='title ' label='Title' />
            </Box>
            <Box mt={4}>
              <InputField
                textarea
                name='text'
                placeholder='text'
                label='Body'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='blue'
              variant='solid'
              color='white'
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
