import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useMutation } from 'urql';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface Props {}

const Register = (props: Props) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          // some optional chaining here
          // will return undefined if no response.data, else return errors
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            // worked
            router.push('/')
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name='username'
                placeholder='username'
                label='Username'
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
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='blue'
              variant='solid'
              color='white'
            >
              REGISTER
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
