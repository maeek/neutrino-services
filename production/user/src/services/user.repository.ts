import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '../schemas/users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async count(filter: FilterQuery<UserDocument>) {
    return this.userModel.count(filter);
  }

  async exists(existsFilterQuery: FilterQuery<UserDocument>) {
    return this.userModel.exists(existsFilterQuery);
  }

  async findOne(
    userFilterQuery: FilterQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel.findOne(userFilterQuery);
  }

  async find(
    usersFilterQuery: FilterQuery<UserDocument>,
  ): Promise<UserDocument[]> {
    return this.userModel.find(usersFilterQuery);
  }

  async create(user: Partial<User>) {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async remove(userFilterQuery: FilterQuery<UserDocument>) {
    return this.userModel.deleteMany(userFilterQuery);
  }

  async findOneAndUpdate(
    userFilterQuery: FilterQuery<UserDocument>,
    user: Partial<User>,
  ) {
    return this.userModel.findOneAndUpdate(userFilterQuery, user, {
      new: true,
    });
  }
}
