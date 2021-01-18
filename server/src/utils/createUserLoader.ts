import DataLoader from 'dataloader';
import { User } from '../entities/User';

// DATALOADER - batches requests so instead of having 15 SQL queries for 15 users, you just have the one
// also CACHES the requests

// [1, 87, 8, 9]
// [{id: 1, username 'bob'}, {}, {}, {}]

// need to return data in shape above
export const createUserLoader = () =>
  new DataLoader<number, User>(async userIds => {
    // get users
    const users = await User.findByIds(userIds as number[]);

    // create user id, to user object
    const userIdToUser: Record<number, User> = {};

    // populate object
    // need bracket notation on objects because numbers
    users.forEach(u => {
      userIdToUser[u.id] = u;
    });

    return userIds.map(userId => userIdToUser[userId]);
  });
