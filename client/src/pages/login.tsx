import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

interface Props {}

const Login = (props: Props) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          // some optional chaining here
          // will return undefined if no response.data, else return errors
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            router.push('/');
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name='usernameOrEmail'
                placeholder='username or email'
                label='Username Or Email'
              />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                type='password'
                label='Password'
              />
            </Box>
            <Flex>
                <NextLink href='/forgot-password'>
                  <Link mt={2} ml='auto'>Forgot Password?</Link>
                </NextLink>
            </Flex>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='blue'
              variant='solid'
              color='white'
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
