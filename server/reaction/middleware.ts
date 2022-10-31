import type {Request, Response, NextFunction} from 'express';
import {ObjectId, Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import CommentCollection from '../comment/collection';
import UserCollection from '../user/collection';
import ReactionCollection from '../reaction/collection';
import ReactionModel, { reactionTypeSet } from './model';


/**
 * checks if only one reaction exists per author per item
 */
const checkOneAuthorReaction = async (req: Request, res: Response, next: NextFunction) => {
  let item: any;
  if(req.body.itemType === "Comment"){
    item = await CommentCollection.findOne(req.body.itemId);
  }else{
    item = await FreetCollection.findOne(req.body.itemId);
  }

  const author = await UserCollection.findOneByUserId(req.session.userId);
  const reaction = await ReactionModel.find({$and: [{itemId: item._id}, {authorId: author._id}]});

  if(reaction && reaction.length > 0){
    res.status(409).json({
      error: `Cannot add a new reaction from ${author.username} because one already exists.`
    });
    return;
  }

  next();
};

/**
 * checks if valid reaction type is given
 */
const isValidReactionType = async (req: Request, res: Response, next: NextFunction) => {
  let reactionType = req.params.reactionType;
  console.log(reactionType);
  console.log(req.body);

  if(!reactionType || reactionType == "undefined")
    reactionType = req.body.reactionType;

  console.log("reactionType: " + reactionType);

  if(!reactionType){
    res.status(400).json({
      error: 'Provided reactionType must be nonempty.'
    });
    return;
  }

  if(!reactionTypeSet.has(reactionType)){
    res.status(400).json({
      error: "Provided reactionType must be either 'Angry','Sad','Wow','Love','Like','Dislike'"
    });
    return;
  }

  next();
};

/**
 * checks if valid item type is given
 */
const isValidItemType = async (req: Request, res: Response, next: NextFunction) => {
  let itemType = req.query.itemType ? req.query.itemType : req.params.itemType;
  if(!itemType || itemType == "undefined")
    itemType = req.body.itemType;

  if(!itemType){
    res.status(400).json({
      error: 'Provided itemType must be nonempty.'
    });
    return;
  }

  if(itemType !== "Comment" && itemType !== "Freet"){
    res.status(400).json({
      error: 'Provided itemType must be either "Freet" or "Comment"'
    });
    return;
  }

  next();
};

/**
 * Checks if a reaction with reactionId is req.params exists
 */
 const isReactionExists = async (req: Request, res: Response, next: NextFunction) => {
  let reactionId = req.params.reactionId ? req.params.reactionId : String(req.query.reactionId)
  if(reactionId == undefined || reactionId == "undefined"){
    reactionId = req.body.reactionId ? String(req.body.reactionId) : String(req.query.reactionId);
  }
  if (!reactionId) {
    res.status(400).json({
      error: 'Provided reactionId must be nonempty.'
    });
    return;
  }

  const validFormat = Types.ObjectId.isValid(reactionId);
  const reaction = validFormat ? await ReactionCollection.findOne(reactionId) : '';

  
  if (!reaction) {
    res.status(404).json({
      error: {
        reactionNotFound: `Reaction with reaction ID ${reactionId} does not exist.`
      }
    });
    return;
  }

  next();
};

  /**
   * Checks if the current user is the author of the reaction whose reactiontId is in req.params
   */
  const isValidReactionModifier = async (req: Request, res: Response, next: NextFunction) => {
  const reaction = await ReactionCollection.findOne(req.params.reactionId);
  const userId = reaction.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' reactions.'
    });
    return;
  }

  next();
};


export {
  isValidItemType,
  isValidReactionType,
  checkOneAuthorReaction,
  isValidReactionModifier,
  isReactionExists
};
