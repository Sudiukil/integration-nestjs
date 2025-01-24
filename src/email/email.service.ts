import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailEntity } from './email.entity';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { EmailId, IAddEmail, IEmail } from './email.interfaces';
import { EmailFiltersArgs } from './email.types';
import { IAddUser, IUser, UserId } from 'src/user/user.interfaces';
import { UserService } from '../user/user.service';

// Exo 4: implémentation du service pour les e-mails
@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
    private readonly _userService: UserService,
  ) {}

  // Exo 4: méthode pour récupérer un email par son identifiant
  get(id: EmailId): Promise<IEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }

  // Exo 4: Méthode pour récupérer une liste d'e-mails correspondants à des filtres
  // (déplacement de la logique de l'exo 2)
  getEmails(filters: EmailFiltersArgs, userId?: string): Promise<IEmail[]> {
    const where: FindOptionsWhere<EmailEntity> = {};

    if (userId) {
      where.userId = Equal(userId);
    }

    if (filters.address) {
      const addresses = [
        ...(filters.address.equal ? [filters.address.equal] : []),
        ...(filters.address.in ? filters.address.in : []),
      ];

      if (addresses.length > 0) {
        where.address = In(addresses);
      }
    }

    return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }

  // Exo 5: méthode pour ajouter un e-mail à un utilisateur
  async addEmail(email: IAddEmail) {
    const userExists = await this._userService.get(email.userId);

    // Exo 5: on vérifie que l'utilisateur existe et est actif
    if (!userExists || userExists.status === 'inactive') {
      throw new NotFoundException(
        `L'utilisateur n'a pas été trouvé ou est désactivé`,
      );
    }

    const addEmail = await this.emailRepository.insert({
      ...email,
    });
    const emailId = addEmail.identifiers[0].id;

    return emailId;
  }
}
