import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import ReactionCollection from './collection';
import * as userValidator from '../user/middleware';
import * as commentValidator from '../comment/middleware';
import * as freetValidator from '../freet/middleware';
import * as reactionValidator from '../reaction/middleware';
import * as util from './util';


const router = express.Router();

/**
 * Get all the reactions
 *
 * @name GET /api/reactions
 *
 * @return {ReactionResponse[]} - A list of all the reactions sorted in descending
 *                      order by date modified
 */

/**
 * Get reactions by author.
 *
 * @name GET /api/reactions?authorId=id
 *
 * @return {CommentResponse[]} - An array of comments created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
 router.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
      // Check if authorId query parameter was supplied
      if (req.query.author !== undefined) {
        next();
      }
      else if (req.query.itemId !== undefined) {
        console.log("querying " + req.query.itemId);
        next('route');
      }
      else{
        const allReactions = await ReactionCollection.findAll();
        const response = allReactions.map(util.constructReactionResponse);
        res.status(200).json(response);
      }
    },
    [
      userValidator.isAuthorExists
    ],
    async (req: Request, res: Response) => {
      const authorComments = await ReactionCollection.findAllByUsername(req.query.author as string);
      const response = authorComments.map(util.constructReactionResponse);
      res.status(200).json(response);
    },
  );


router.get(
'/',
[
    reactionValidator.isValidItemType
],
async (req: Request, res: Response, next: NextFunction) => {
    if(req.query.itemType === "Freet"){
      next();
    }
    else
      next('route');
},
[
  freetValidator.isFreetExists
],
async (req: Request, res: Response) => {
    const freetReactions = await ReactionCollection.findAllByItem(req.query.itemType as string,req.query.itemId as string);
    const response = freetReactions.map(util.constructReactionResponse);
    res.status(200).json(response);
}
);


router.get(
  '/',
  [
      commentValidator.isCommentExists
  ],
  async (req: Request, res: Response) => {
    const commentReactions = await ReactionCollection.findAllByItem(req.query.itemType as string,req.query.itemId as string);
    const response = commentReactions.map(util.constructReactionResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new reaction.
 *
 * @name POST /api/reactions
 *
 * @param {string} reactionType - The reactionType of the reaction
 * @param {string} itemType - The itemType the reaction is made to
 * @return {ReactionResponse} - The created reaction
 * @throws {403} - If the user is not logged in
 * @throws {400} - If reaction type is not specified or incorrect, the item type is not specified or incorrect, the freet/comment isn't specified
 * @throws {404} - If the freet/comment doesn't exist
 * @throws {409} - If the user has already reacted to the given item
 */
 router.post(
    '/',
    [
      userValidator.isUserLoggedIn,
      reactionValidator.isValidReactionType,
      reactionValidator.isValidItemType,
    ],
    async (req: Request, res: Response, next: NextFunction) => {

      const itemType = (req.body.itemType as string) ?? '';

      if(itemType === "Freet"){
        next();
      }
      else{
        next('route')
      }
    },
    [
      freetValidator.isFreetExists,
      reactionValidator.checkOneAuthorReaction
    ],
    async (req: Request, res: Response) => {
      const itemType = (req.body.itemType as string) ?? '';
      const reactionType = (req.body.reactionType as string) ?? '';
      const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
      const freetId = (req.body.itemId as string) ?? '';

      const reaction = await ReactionCollection.addOne(userId, itemType,freetId, reactionType); 
  
      res.status(201).json({
        message: 'Your reaction was created successfully.',
        comment: util.constructReactionResponse(reaction)
      });
    }
  );

  router.post(
    '/',
    [
      commentValidator.isCommentExists,
      reactionValidator.checkOneAuthorReaction
    ],
    async (req: Request, res: Response) => {
      const itemType = (req.body.itemType as string) ?? '';
      const reactionType = (req.body.reactionType as string) ?? '';
      const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
      const commentId = (req.body.itemId as string) ?? '';
      const reaction = await ReactionCollection.addOne(userId, itemType,commentId, reactionType); 
  
      res.status(201).json({
        message: 'Your reaction was created successfully.',
        comment: util.constructReactionResponse(reaction)
      });
    }
  );

/**
 * Delete a reaction
 *
 * @name DELETE /api/reactions/:reactionId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the reaction
 * @throws {404} - If the reactionId is not valid
 */+
 router.delete(
  '/:reactionId?',
  [
    userValidator.isUserLoggedIn,
    reactionValidator.isReactionExists,
    reactionValidator.isValidReactionModifier
  ],
  async (req: Request, res: Response) => {
    await ReactionCollection.deleteOne(req.params.reactionId);
    res.status(200).json({
      message: 'Your reaction was deleted successfully.'
    });
  }
);

/**
 * Modify a reaction
 *
 * @name PUT /api/reactions/:reactionId
 *
 * @return {ReactionResponse} - the updated reaction
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the reaction
 * @throws {404} - If the reactionId is not valid
 * @throws {400} - If reaction type is not specified or incorrect
 */
 router.put(
  '/:reactionId?',
  [
    userValidator.isUserLoggedIn,
    reactionValidator.isReactionExists,
    reactionValidator.isValidReactionModifier,
    reactionValidator.isValidReactionType
  ],
  async (req: Request, res: Response) => {
    console.log(req.body);
    const reaction = await ReactionCollection.updateOne(req.params.reactionId, req.body.reactionType);
    res.status(200).json({
      message: 'Your freet was updated successfully.',
      reaction: util.constructReactionResponse(reaction)
    });
  }
 );

export {router as reactionRouter};