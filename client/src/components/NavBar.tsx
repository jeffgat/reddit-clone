import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface Props {}

const NavBar = (props: Props) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;

  if (fetching) {
    
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link color='white' m={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href='/register'>
          <Link color='white' m={2}>
            Register
          </Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box color='white' m={2}>
          {data.me.username}
        </Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant='link'
          m={2}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex='1' position='sticky' bg='black' p={4}>
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
