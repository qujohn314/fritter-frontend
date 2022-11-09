import type {Request, Response, NextFunction} from 'express';
import {ObjectId, Types} from 'mongoose';
import UserModel from '../user/model';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';
import StreamCollection from './collection';
import StreamModel from './model';

/**
 * Checks if a owner with ownerId is already has a stream
 */
 const isStreamCreated = async (req: Request, res: Response, next: NextFunction) => {
  let ownerId = req.params.ownerId ? req.params.ownerId : String(req.query.ownerId)
  if(ownerId == undefined || ownerId == "undefined"){
    ownerId = req.body.ownerId ? String(req.body.ownerId) : String(req.query.ownerId);
  }

  if (!ownerId) {
    console.log(ownerId);
    res.status(400).json({
      error: 'Provided userId must be nonempty.'
    });
    return;
  }

  let validFormat = Types.ObjectId.isValid(ownerId);

  if (!validFormat){
    let owner = await UserCollection.findOneByUsername(ownerId);
    
    if(!owner){
      res.status(404).json({
        error: `user with ID ${ownerId} does not exist.`
      });
      return;
    }
    ownerId = String(owner._id);
  }

  validFormat = Types.ObjectId.isValid(ownerId);
  const stream = validFormat ? await StreamCollection.findOneByOwner(ownerId) : '';

  if (!stream) {
    res.status(404).json({
      error: {
        streamNotFound: `user with ID ${ownerId} does not own a stream. User has not created a stream yet.`
      }
    });
    return;
  }

  next();
}

/**
 * Checks if a owner with ownerId is already has a stream. Avoids multiple
 */
 const isStreamDuplicated = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const stream = await StreamCollection.findOneByOwner(user);

  if (stream) {
    res.status(409).json({
      error: {
        multipleStreamsFound: `user with ID ${String(user)} already owns a stream. Cannot have multiple streams.`
      }
    });
    return;
  }
  
  next();
}

 const isValidFreetCount = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const stream = await StreamCollection.findOneByOwner(user);
  let count = req.body.maxSize;
  if(count && (count > 15 || count < 5)){
    res.status(416).json({
      error: {
        invalidRange: `${count} is outside of the allowed range. Max stream size must be between 5-15 inclusive`
      }
    });
    return;
  }

  
  next();
}

const isValidRefreshTime = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const stream = await StreamCollection.findOneByOwner(user);
  let count = req.body.refreshTimer;
  if(count && (count > 300 || count < 10)){
    res.status(416).json({
      error: {
        invalidRange: `${count} is outside of the allowed range. Mefresh timer must be between 10-300 inclusive seconds `
      }
    });
    return;
  }

  
  next();
}

const isFreetInStream = async (req: Request, res: Response, next: NextFunction) => {
  let freetId = req.body.freetId ? req.body.freetId : req.params.freetId;

  const user = req.session.userId;
  const streamId  = await StreamCollection.findOneByOwner(user);
  
  const stream = await StreamCollection.findOne(streamId._id);
  const freet = await FreetCollection.findOne(freetId);

  if(!stream.streamFreets.id(freet._id)){
    res.status(404).json({
      error: {
        streamNotFound: `Freet with ID ${String(freet._id)} is not in the set of uncaptured freets in the stream.`
      }
    });
    return;
  }
  
  next();
  }


 const isFreetInCaptured = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
    const streamId  = await StreamCollection.findOneByOwner(user);
  
  const stream = await StreamCollection.findOne(streamId._id);
  const freetId = req.body.freetId ? req.body.freetId : req.params.freetId;
  const freet = await FreetCollection.findOne(freetId);

  if(!stream.capturedFreets.id(freet._id)){
    res.status(404).json({
      error: {
        streamNotFound: `Freet with ID ${String(freet._id)} is not in the set of captured freets in the stream.`
      }
    });
    return;
  }
  
  next();
  }

/**
 * Checks if a stream with streamId exists
 */
 const isStreamExists = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const validFormat = Types.ObjectId.isValid(user);
  const stream = validFormat ? await StreamCollection.findOneByOwner(user) : '';

  
  if (!stream) {
    res.status(404).json({
      error: {
        streamNotFound: `User does not have existing stream.`
      }
    });
    return;
  }

  next();
  }

  /**
 * Checks if a stream with streamId exists
 */
 const isStreamCapacity = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const streamId  = await StreamCollection.findOneByOwner(user);
  const stream = await StreamCollection.findOne(streamId._id);

  
  if (stream.streamFreets.length + stream.capturedFreets.length >= stream.maxSize) {
    res.status(409).json({
      error: {
        Error: `Cannot add more freets to stream: Stream at max capacity.`
      }
    });
    return;
  }

  next();
  }

    /**
 * Checks if a stream with streamId exists
 */
 const isFreetStreamEligible = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.userId;
  const streamId  = await StreamCollection.findOneByOwner(user);

  const stream = await StreamCollection.findOne(streamId._id);

  const freetId = req.body.freetId ? req.body.freetId : req.params.freetId;
  const freet = await FreetCollection.findOne(freetId);

  if(freet.authorId._id == req.session.userId){
    res.status(409).json({
      error: {
        Error: `Cannot add freet to stream since user is the author of the freet.`
      }
    });
    return;
  }

  if(stream.capturedFreets.id(req.params.freetId) || stream.streamFreets.id(req.params.freetId)){
    res.status(409).json({
      error: {
        Error: `Cannot add freet to stream since freet already exists in stream.`
      }
    });
    return;
  }

  next();
  }

  /**
   * Checks if the current user is the author of the reaction whose reactiontId is in req.params
   */
   const isValidStreamModify = async (req: Request, res: Response, next: NextFunction) => {
    const stream = await StreamCollection.findOne(req.params.streamId);
    const userId = stream.ownerId._id;
    if (req.session.userId !== userId.toString()) {
      res.status(403).json({
        error: 'Cannot modify other users\' streams.'
      });
      return;
    }
  
    next();
  };

export {
  isStreamExists,
  isStreamCreated,
  isStreamDuplicated,
  isStreamCapacity,
  isFreetStreamEligible,
  isFreetInCaptured,
  isFreetInStream,
  isValidStreamModify,
  isValidFreetCount,
  isValidRefreshTime
};
