import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import React, { FunctionComponent, useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient, WithUrqlProps } from 'next-urql';
import NextLink from 'next/link';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name='newPassword'
                placeholder='new password'
                label='New Password'
                type='password'
              />
            </Box>
            {tokenError ? (
              <Flex>
                <Box mr={2} style={{ color: 'red' }}>
                  {tokenError}
                </Box>
                <NextLink href='/forgot-password'>
                  <Link>Get a new token</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='blue'
              variant='solid'
              color='white'
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// .getInitialProps lets us get any QUERY PARAMS and pass it to this COMPONENT
ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(
  ChangePassword as FunctionComponent<WithUrqlProps>
);
