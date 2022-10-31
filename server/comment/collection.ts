import type {HydratedDocument, Types} from 'mongoose';
import type {Comment} from './model';
import CommentModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';

class CommentCollection {
    /**
     * Add a comment to the collection
     *
     * @param {string} authorId - The id of the author of the comment
     * @param {string} parentFreetId - The id of the parent freet of the comment
     * @param {string} content - The id of the content of the freet
     * @return {Promise<HydratedDocument<Comment>>} - The newly created comment
     */
    static async addOne(authorId: Types.ObjectId | string, parentFreetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Comment>> {
      const date = new Date();
      const comment = new CommentModel({
        authorId,
        parentFreetId,
        dateCreated: date,
        content,
        dateModified: date
      });


      await comment.save(); // Saves comment to MongoDB
      //Might be wrong
      return comment.populate('authorId');
    }

        /**
     * Get all the comments in the database
     *
     * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the freets
     */
    static async findAll(): Promise<Array<HydratedDocument<Comment>>> {
        // Retrieves freets and sorts them from most to least recent
        return CommentModel.find({}).sort({dateCreated: -1}).populate('authorId');
    }

    /**
     * Find a comment by commentId
     *
     * @param {string} commentId - The id of the comment to find
     * @return {Promise<HydratedDocument<Comment>> | Promise<null> } - The comment with the given commentId, if any
    */
    static async findOne(commentId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
        return CommentModel.findOne({_id: commentId}).populate('authorId');
    } 

    /**
   * Get all the comments in by given author
   *
   * @param {string} username - The username of author of the comments
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Comment>>> {
    const author = await UserCollection.findOneByUsername(username);
    return CommentModel.find({authorId: author._id}).populate('authorId');
  }

  /**
   * Get all the comments in by given freet
   *
   * @param {string} freetId - The freetID of freet of the comments
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
   static async findAllByFreet(freetId: string): Promise<Array<HydratedDocument<Comment>>> {
    const freet = await FreetCollection.findOne(freetId);
    return CommentModel.find({parentFreetId: freet._id}).populate('authorId');
  }

    /**
  * Delete a comment with given commentId.
  *
  * @param {string} commentId - The commentId of comment to delete
  * @return {Promise<Boolean>} - true if the comment has been deleted, false otherwise
  */
  static async deleteOne(commentId: Types.ObjectId | string): Promise<boolean> {
    const comment = await CommentModel.deleteOne({_id: commentId});
    return comment !== null;
  }

  /**
   * Delete all the comments by the given author
   *
   * @param {string} authorId - The id of author of comments
   */
   static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await CommentModel.deleteMany({authorId});
  }
}


export default CommentCollection;