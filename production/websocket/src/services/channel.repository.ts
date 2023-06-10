import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';

@Injectable()
export class ChannelsRepository {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  async count(filter: FilterQuery<ChannelDocument>) {
    return this.channelModel.count(filter);
  }

  async exists(existsFilterQuery: FilterQuery<ChannelDocument>) {
    return this.channelModel.exists(existsFilterQuery);
  }

  async findOne(
    channelFilterQuery: FilterQuery<ChannelDocument>,
  ): Promise<ChannelDocument> {
    return this.channelModel.findOne(channelFilterQuery);
  }

  async find(
    channelsFilterQuery: FilterQuery<ChannelDocument>,
    offset = 0,
    limit = 50,
  ): Promise<ChannelDocument[]> {
    return this.channelModel.find(
      channelsFilterQuery,
      {},
      {
        skip: offset,
        limit,
      },
    );
  }

  async create(channel: Partial<Channel>) {
    const newChannel = new this.channelModel(channel);
    return newChannel.save();
  }

  async remove(channelFilterQuery: FilterQuery<ChannelDocument>) {
    return this.channelModel.deleteMany(channelFilterQuery);
  }

  async findOneAndUpdate(
    channelFilterQuery: FilterQuery<ChannelDocument>,
    channel: UpdateQuery<Partial<Channel>>,
  ) {
    return this.channelModel.findOneAndUpdate(channelFilterQuery, channel, {
      new: true,
    });
  }
}
