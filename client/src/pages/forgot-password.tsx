import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

interface Props {}

const ForgotPassword = (props: Props) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Wrapper>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async values => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, you'll see an email in your
              inbox
            </Box>
          ) : (
            <Form>
              <Box mt={4}>
                <InputField
                  name='email'
                  placeholder='email'
                  type='email'
                  label='Email'
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
                Login
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
