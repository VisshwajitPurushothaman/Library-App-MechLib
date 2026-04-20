import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>) {
    const { email, roll_number } = userData;
    const existing = await this.usersRepository.findOne({
      where: [{ email: email?.toLowerCase() }, { roll_number: roll_number?.toUpperCase() }],
    });

    if (existing) {
      throw new ConflictException('User with this email or roll number already exists');
    }

    if (userData.password_hash) {
      userData.password_hash = await bcrypt.hash(userData.password_hash, 10);
    }

    const user = this.usersRepository.create({
      ...userData,
      email: email?.toLowerCase(),
      roll_number: roll_number?.toUpperCase(),
    });

    return this.usersRepository.save(user);
  }

  async findOneById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByIdentifier(identifier?: string) {
    if (!identifier || typeof identifier !== 'string') {
      return null; // Return null instead of throwing error (Requirement #1)
    }

    const user = await this.usersRepository.findOne({
      where: [
        { email: identifier.toLowerCase() }, // Normalize (Requirement #2)
        { roll_number: identifier.toUpperCase() }, // Normalize (Requirement #2)
      ],
    });
    return user;
  }

  async update(id: string, updates: Partial<User>) {
    await this.usersRepository.update(id, updates);
    return this.findOneById(id);
  }

  async remove(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('Cannot delete yourself');
    }
    const result = await this.usersRepository.delete(id);
    return { deleted: result.affected };
  }

  async findAll(q?: string) {
    const query = this.usersRepository.createQueryBuilder('user');

    if (q) {
      query.where('user.name LIKE :q OR user.email LIKE :q OR user.roll_number LIKE :q', {
        q: `%${q}%`,
      });
    }

    return query.select(['user.id', 'user.name', 'user.email', 'user.roll_number', 'user.role', 'user.department', 'user.created_at']).getMany();
  }
}
