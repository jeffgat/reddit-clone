import React from 'react';
import NextLink from 'next/link';
import { Box, IconButton } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface Props {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons = ({ id, creatorId }: Props) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  if (meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
        <IconButton
          mr={2}
          icon={<EditIcon />}
          aria-label='Edit post'
          size='sm'
        />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label='Delete post'
        size='sm'
        onClick={() => {
          deletePost({ id: id });
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
