import { usePostQuery } from '../generated/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return usePostQuery({
    // id will never be -1, so we set it to -1 and don't bother to query the server
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
