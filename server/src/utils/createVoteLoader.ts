import DataLoader from 'dataloader';
import { Vote } from '../entities/Vote';

// [{postId: 5, userId: 10}]
// [{postId: 5, userId: 10, value: 1}]
export const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Vote | null>(
    async keys => {
      const votes = await Vote.findByIds(keys as any);

      const voteIdsToVote: Record<string, Vote> = {};

      votes.forEach(vote => {
        voteIdsToVote[`${vote.userId}|${vote.postId}`] = vote;
      });

      return keys.map(key => voteIdsToVote[`${key.userId}|${key.postId}`]);
    }
  );
