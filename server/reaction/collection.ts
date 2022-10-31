import type {HydratedDocument, Types} from 'mongoose';
import type {Reaction} from './model';
import ReactionModel from './model';
import FreetCollection from '../freet/collection';
import CommentCollection from '../comment/collection';
import UserCollection from '../user/collection';


class ReactionCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} itemType - The model type of the item being reacted to
   * @param {string} itemId - The id of the of the item being reacted to
   * @param {string} reaction_type - The reaction type
   * @return {Promise<HydratedDocument<Reaction>>} - The newly created reaction
   */
  static async addOne(authorId: Types.ObjectId | string, itemType: string, itemId: Types.ObjectId | string, reactionType: string): Promise<HydratedDocument<Reaction>> {
    const date = new Date();
    const reaction = new ReactionModel({
      authorId,
      itemType,
      itemId,
      dateCreated: date,
      reactionType,
      dateModified: date
    });
    await reaction.save(); // Saves freet to MongoDB
    return reaction.populate('authorId itemId');
  }

  /**
   * Find a reaction by reactionId
   *
   * @param {string} reactionId - The id of the reaction to find
   * @return {Promise<HydratedDocument<Reaction>> | Promise<null> } - The reaction with the given reactionId, if any
   */
     static async findOne(reactionId: Types.ObjectId | string): Promise<HydratedDocument<Reaction>> {
      return ReactionModel.findOne({_id: reactionId}).populate('authorId');
    }

  /**
   * Get all the reactions in the database
   *
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the Reactions
   */
  static async findAll(): Promise<Array<HydratedDocument<Reaction>>> {
      // Retrieves reactions and sorts them from most to least recent
      return ReactionModel.find({}).sort({dateModified: -1}).populate('authorId');
  }

  /**
   * Get all of the reactions corresponding to an item in the database
   *
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reaction
   */
   static async findAllByItem(itemType:string, itemID:string): Promise<Array<HydratedDocument<Reaction>>> {
    // Retrieves freets and sorts them from most to least recent
    let item: any;
    if(itemType === "Comment")
      item = await CommentCollection.findOne(itemID);
    else if(itemType === "Freet")
      item = await FreetCollection.findOne(itemID);
    else
      return

    return ReactionModel.find({itemId: item._id}).populate('authorId');
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the reaction
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reactions
   */
   static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Reaction>>> {
    const author = await UserCollection.findOneByUsername(username);
    return ReactionModel.find({authorId: author._id}).populate('authorId');
  }

    /**
   * Delete a reaction with given reactionId.
   *
   * @param {string} reactionId - The reactionId of reaction to delete
   * @return {Promise<Boolean>} - true if the reaction has been deleted, false otherwise
   */
     static async deleteOne(reactionId: Types.ObjectId | string): Promise<boolean> {
      const reaction = await ReactionModel.deleteOne({_id: reactionId});
      return reaction !== null;
    }

    /**
   * Delete all reactions from a given item.
   * 
   * @return {Promise<Boolean>} - true if the reactions have been deleted, false otherwise
   */
     static async deleteManyFromItem(itemId: Types.ObjectId | string): Promise<boolean> {
      const reactions = await ReactionModel.deleteMany({itemId});
      return reactions !== null;
    }

    /**
   * Delete all the reactions by the given author
   *
   * @param {string} authorId - The id of author of reactions
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await ReactionModel.deleteMany({authorId});
  }

  /**
   * Update a reaction with a new reactionType
   *
   * @param {string} reactionId - The id of the reaction to be updated
   * @param {string} reationType - The new reactionType of the reaction
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
     static async updateOne(reactionId: Types.ObjectId | string, reactionType: string): Promise<HydratedDocument<Reaction>> {
      const reaction = await ReactionModel.findOne({_id: reactionId});
      reaction.reactionType = reactionType;
      reaction.dateModified = new Date();
      await reaction.save();
      return reaction.populate('authorId');
    }
}



export default ReactionCollection;
