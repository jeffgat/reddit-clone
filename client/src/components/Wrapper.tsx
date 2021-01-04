import { Box } from '@chakra-ui/react';

interface Props {
  children: any;
  variant?: 'small' | 'regular';
}

const Wrapper = ({children, variant = 'regular'}: Props) => {
  return (
    <Box
      mt={8}
      mx='auto'
      maxW={variant === 'regular' ? '800px' : '400px'}
      w='100%'
    >
      {children}
    </Box>
  );
};

export default Wrapper;
