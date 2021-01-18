import React, { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface Props {
  post: PostSnippetFragment;
}

const VoteSection = ({ post }: Props) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [, vote] = useVoteMutation();

  return (
    <Flex direction='column' alignItems='center' justifyContent='center' mr={4}>
      {/* UPVOTE */}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState('upvote-loading');
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'upvote-loading'}
        aria-label='Upvote Post'
        icon={<ArrowUpIcon />}
        size='sm'
        colorScheme={post.voteStatus === 1 ? 'teal' : undefined}
        color={post.voteStatus === 1 ? 'white' : 'black'}
      ></IconButton>
      <Text my={1}>{post.points}</Text>

      {/* DOWNVOTE */}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState('downvote-loading');
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'downvote-loading'}
        aria-label='Downvote Post'
        icon={<ArrowDownIcon />}
        size='sm'
        colorScheme={post.voteStatus === -1 ? 'pink' : undefined}
        color={post.voteStatus === -1 ? 'white' : 'black'}
      ></IconButton>
    </Flex>
  );
};

export default VoteSection;
