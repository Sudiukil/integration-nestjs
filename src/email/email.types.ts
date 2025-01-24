import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Maybe } from 'graphql/jsutils/Maybe';
import {
  IAddEmail,
  IEmail,
  IEmailFilters,
  IRemoveEmail,
} from './email.interfaces';

@ObjectType()
export class UserEmail implements IEmail {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  userId: string;
}

@InputType()
export class StringFilters {
  @IsOptional()
  @Field(() => String, { nullable: true })
  equal: Maybe<string>;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  in: Maybe<string[]>;
}

@ArgsType()
export class EmailFiltersArgs implements IEmailFilters {
  @IsOptional()
  @Field(() => StringFilters, { nullable: true })
  address?: Maybe<StringFilters>;
}

// Exo 5: on ajoute un type d'entrée pour ajouter un e-mail
@InputType()
@ArgsType()
export class AddEmail implements IAddEmail {
  @Field(() => String)
  // Exo 5: on utilise l'annotation IsEmail pour valider le format de l'adresse e-mail
  @IsEmail()
  address: string;

  @Field(() => ID)
  userId: string;
}

// Exo 5: on ajoute un type d'entrée pour supprimer un e-mail
@InputType()
@ArgsType()
export class RemoveEmail implements IRemoveEmail {
  @IsUUID('all', {
    message: `L'identifiant de l'e-mail doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'e-mail doit être défini` })
  @Field(() => ID)
  id: string;
}
