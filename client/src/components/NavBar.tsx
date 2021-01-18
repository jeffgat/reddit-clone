import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { AddIcon } from '@chakra-ui/icons';

interface Props {}

const NavBar = (props: Props) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  // do not not query the server
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
      <Flex align='center'>
        <Box m={2}>
          <NextLink href='/create-post'>
            <Button
              as={Link}
              fontWeight='medium'
              colorScheme='green'
              variant='solid'
              ml='auto'
              leftIcon={<AddIcon w={3} h={3} />}
            >
              Create Post
            </Button>
          </NextLink>
        </Box>
        <Box color='white' m={2}>
          <Text fontWeight='medium'>{data.me.username}</Text>
        </Box>
        <Button
          onClick={() => {
            logout();
          }}
          fontWeight='medium'
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
      <Flex maxW={800} align='center' flex={1} m='auto'>
        <NextLink href='/'>
          <Link color='white' m={2}>
            <Heading>Reddit 2</Heading>
          </Link>
        </NextLink>
        <Box ml={'auto'}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
