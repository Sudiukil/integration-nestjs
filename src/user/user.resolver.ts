import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { EmailFiltersArgs, UserEmail } from '../email/email.types';
import { EmailEntity } from '../email/email.entity';
import { UserId } from './user.interfaces';
import { UserService } from './user.service';
import { AddUser, User, UserIdArgs } from './user.types';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly _service: UserService,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  getUser(@Args() { userId }: UserIdArgs): Promise<User> {
    return this._service.get(userId);
  }

  @Mutation(() => ID)
  addUser(@Args() user: AddUser): Promise<UserId> {
    return this._service.add(user);
  }

  @Mutation(() => ID)
  deactivateUser(@Args() { userId }: UserIdArgs): Promise<UserId> {
    return this._service.deactivate(userId);
  }

  // Exo 1: le type était à UserEmail au lieu de UserEmail[]
  @ResolveField(() => [UserEmail], { name: 'emails' })
  async getEmails(
    @Parent() user: User,
    @Args() filters: EmailFiltersArgs,
  ): Promise<UserEmail[]> {
    const where: FindOptionsWhere<EmailEntity> = {
      userId: Equal(user.id),
    };

    if (filters.address) {
      // Exo 2: au lieu que In écrase Equal, on fusionne les deux filtres en une seule liste
      const addresses = [
        ...(filters.address.equal ? [filters.address.equal] : []),
        ...(filters.address.in ? filters.address.in : []),
      ];

      // Exo 2: on applique le filtre sur les adresses
      if (addresses.length > 0) {
        where.address = In(addresses);
      }
    }

    return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }
}
