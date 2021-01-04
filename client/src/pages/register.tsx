import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface Props {}

const Register = (props: Props) => {
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={values => {
          console.log(values);
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
