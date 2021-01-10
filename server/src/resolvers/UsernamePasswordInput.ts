import {
  Field,
  InputType
} from 'type-graphql';

// here we're abstracting setting the ARGS ins @Arg, and then we can re-use this

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}
