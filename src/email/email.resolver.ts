import { Mutation } from '@nestjs/graphql';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  AddEmail,
  EmailFiltersArgs,
  RemoveEmail,
  UserEmail,
} from './email.types';
import { User } from '../user/user.types';
import { EmailService } from './email.service';
import { UserService } from '../user/user.service';
import { EmailId } from './email.interfaces';

@Resolver(() => UserEmail)
export class EmailResolver {
  // Exo 4: on injecte les deux services nécessaires (email et user)
  constructor(
    private readonly _service: EmailService,
    private readonly _userService: UserService,
  ) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    // Exo 4: cf. service
    return this._service.get(emailId);
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    // Exo 4: cf. service
    return this._service.getEmails(filters);
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    // Exo 4: on utilise l'objet parent pour récupérer l'utilisateur associé à l'e-mail
    return this._userService.get(parent.userId);
  }

  // Exo 5: mutation pour ajouter un mail à un utilisateur
  @Mutation(() => ID)
  addEmail(@Args('email') email: AddEmail): Promise<EmailId> {
    return this._service.addEmail(email);
  }

  // Exo 5: mutation pour supprimer un mail
  @Mutation(() => ID)
  removeEmail(@Args('email') email: RemoveEmail): Promise<EmailId> {
    return this._service.removeEmail(email);
  }
}
