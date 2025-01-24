import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailEntity } from './email.entity';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { EmailId, IEmail } from './email.interfaces';
import { EmailFiltersArgs } from './email.types';

// Exo 4: implémentation du service pour les e-mails
@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
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
}
