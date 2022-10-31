import type {HydratedDocument, Types} from 'mongoose';
import {defaultSize, defaultTimer, Stream} from './model';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';
import StreamModel from './model';
import FreetModel from '../freet/model';


class StreamCollection {
  /**
   * Add a stream to the collection
   *
   * @param {string} ownerId - The id of the owner of the stream
   * @return {Promise<HydratedDocument<Stream>>} - The newly created stream
   */
   static async addOne(ownerId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    const stream = new StreamModel({
      ownerId,
      streamFreets : [],
      capturedFreets : [],
      maxSize: defaultSize,
      refreshTimer: defaultTimer
    });
    await stream.save();
    return stream.populate('ownerId');
  }

  /**
   * Add a freet to a stream
   *
   * @param {string} streamId - The id of the stream to be added to
   * @param {string} freetId - The id of the freet to be added
   * @return {Promise<HydratedDocument<Stream>>} - The newly created stream
   */
   static async addOneFreet(streamId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    const stream = await StreamModel.findOne({_id: streamId});
    const freet = await FreetModel.findOne({_id: freetId});
    stream.streamFreets.push(freet);

    await stream.save();
    return stream.populate('ownerId');
  }

  static async updateStreamParams(streamId: Types.ObjectId | string, newParams: any): Promise<HydratedDocument<Stream>> {
    const stream = await StreamModel.findOne({_id: streamId});
    console.log(newParams);
    
    if(newParams.refreshTimer !== undefined && newParams.refreshTimer !== ""){
      stream.refreshTimer = newParams.refreshTimer
    }
    if(newParams.maxSize !== undefined && newParams.maxSize !== ""){
      stream.maxSize = newParams.maxSize
    }

    await stream.save();
    return stream.populate('ownerId');
  }

   static async moveOneFreetToCapture(streamId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    const stream = await StreamModel.findOne({_id: streamId});
    const freet = await FreetModel.findOne({_id: freetId});

    stream.capturedFreets.push(freet);
    stream.streamFreets.remove(freet);

    await stream.save();
    return stream.populate('ownerId');
  }

   static async moveOneFreetToStream(streamId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    const stream = await StreamModel.findOne({_id: streamId});
    const freet = await FreetModel.findOne({_id: freetId});
    
    stream.capturedFreets.remove(freet);
    stream.streamFreets.push(freet);

    await stream.save();
    return stream.populate('ownerId');
  }

  static async deleteFreetFromStream(streamId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    const stream = await StreamModel.findOne({_id: streamId});
    const freet = await FreetModel.findOne({_id: freetId});
    
    stream.streamFreets.remove(freet);

    await stream.save();
    return stream.populate('ownerId');
  }

  /**
   * Find a stream by streamId
   *
   * @param {string} streamId - The id of the stream to find
   * @return {Promise<HydratedDocument<Stream>> | Promise<null> } - The stream with the given streamId, if any
   */
   static async findOne(streamId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    return StreamModel.findOne({_id: streamId}).populate('ownerId');
  }

  /**
   * Find all streams
   *
   * @return {Promise<HydratedDocument<Stream>[]>} - The streams
   */
   static async findAll(): Promise<Array<HydratedDocument<Stream>>> {
    return StreamModel.find({}).sort().populate('ownerId');
  }

  /**
   * Find a stream by ownerId
   *
   * @param {string} ownerId - The id of the user that owns the stream
   * @return {Promise<HydratedDocument<Stream>> | Promise<null> } - The stream
   */
   static async findOneByOwner(userId: Types.ObjectId | string): Promise<HydratedDocument<Stream>> {
    return StreamModel.findOne({ownerId: userId}).populate('ownerId');
  }
}








export default StreamCollection;
