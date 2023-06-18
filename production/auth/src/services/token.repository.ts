import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Token, TokenDocument } from '../schemas/token.schema';

@Injectable()
export class TokensRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async count(filter: FilterQuery<TokenDocument>) {
    return this.tokenModel.count(filter);
  }

  async exists(existsFilterQuery: FilterQuery<TokenDocument>) {
    return this.tokenModel.exists(existsFilterQuery);
  }

  async findOne(
    tokenFilterQuery: FilterQuery<TokenDocument>,
  ): Promise<TokenDocument> {
    return this.tokenModel.findOne(tokenFilterQuery);
  }

  async find(
    tokensFilterQuery: FilterQuery<TokenDocument>,
  ): Promise<TokenDocument[]> {
    return this.tokenModel.find(tokensFilterQuery).exec();
  }

  async create(token: Partial<Token>) {
    const newToken = new this.tokenModel(token);
    return newToken.save();
  }

  async remove(tokenFilterQuery: FilterQuery<TokenDocument>) {
    return this.tokenModel.deleteMany(tokenFilterQuery);
  }

  async findOneAndUpdate(
    tokenFilterQuery: FilterQuery<TokenDocument>,
    token: Partial<Token>,
  ) {
    return this.tokenModel.findOneAndUpdate(tokenFilterQuery, token, {
      new: true,
    });
  }
}
