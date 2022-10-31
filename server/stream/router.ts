import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import StreamCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as streamValidator from '../stream/middleware';
import * as util from './util';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';




const router = express.Router();

/**
 * Get all the streams
 *
 * @name GET /api/streams
 *
 * @return {StreamResponse[]} - A list of all the streams sorted by _id
 */

/**
 * Get streams by owner.
 *
 * @name GET /api/streams?ownerId=id
 *
 * @return {StreamResponse} - The stream created by a user with id, ownerId
 * @throws {400} - If ownerId is not given
 * @throws {404} - If no user has given ownerId
 * @throws {404} - If user does not own a stream
 *
 */
 router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.ownerId !== undefined) {
      next();
    }
    else{
      const allStreams = await StreamCollection.findAll();
      const response = allStreams.map(util.constructStreamResponse);
      res.status(200).json(response);
    }
  },
  [
    userValidator.isAuthorExists,
    streamValidator.isStreamCreated
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.query.ownerId as string);
    const stream = await StreamCollection.findOneByOwner(user._id);
    const response = util.constructStreamResponse(stream);
    res.status(200).json(response);
  },
);

/**
 * Create a new stream.
 *
 * @name POST /api/streams
 *
 * @param {string} ownerId - The ownerId of the stream
 * @return {StreamResponse} - The created stream
 * @throws {403} - If the user is not logged in
 * @throws {409} - If the user already has a stream created
 */
 router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamDuplicated
  ],
  async (req: Request, res: Response, next: NextFunction) => {

    const user = req.session.userId;

    const stream = await StreamCollection.addOne(String(user));
    const response = util.constructStreamResponse(stream);
    res.status(200).json(response);
  }
);

/**
 * Modify stream by adding freets
 *
 * @name PUT /api/reactions/:ownerId
 *
 * @return {StreamResponse} - the updated stream
 * @throws {403} - if the user is not logged in or not the owner of
 *                 of the stream
 * @throws {404} - If the streamId or freetId is not valid
 * @throws {409} - If the stream already has the max amount of freets or the freet being add already exists in the stream
 *                 or is authored by the stream owner.
 */
 router.put(
  '/streamParams',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamExists,
    streamValidator.isValidFreetCount,
    streamValidator.isValidRefreshTime
  ],
  async (req: Request, res: Response) => {
    const user = req.session.userId;
    const streamId  = await StreamCollection.findOneByOwner(user);
    const stream = await StreamCollection.updateStreamParams(streamId._id, req.body);

    res.status(200).json({
      message: 'Stream parameters successfully updated',
      stream: util.constructStreamResponse(stream)
    });
  }
 );

/**
 * Modify stream by adding freets
 *
 * @name PUT /api/reactions/:ownerId
 *
 * @return {StreamResponse} - the updated stream
 * @throws {403} - if the user is not logged in or not the owner of
 *                 of the stream
 * @throws {404} - If the streamId or freetId is not valid
 * @throws {409} - If the stream already has the max amount of freets or the freet being add already exists in the stream
 *                 or is authored by the stream owner.
 */
 router.put(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamExists,
    streamValidator.isStreamCapacity,
    freetValidator.isFreetExists,
    streamValidator.isFreetStreamEligible,
  ],
  async (req: Request, res: Response) => {
    const user = req.session.userId;
    const streamId  = await StreamCollection.findOneByOwner(user);
    const stream = await StreamCollection.addOneFreet(streamId._id, req.params.freetId);

    res.status(200).json({
      message: 'Freet successfully added to stream.',
      stream: util.constructStreamResponse(stream)
    });
  }
 );

 router.put(
  '/capture/:freetId?',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamExists,
    freetValidator.isFreetExists,
    streamValidator.isFreetInStream
  ],
  async (req: Request, res: Response) => {
    const user = req.session.userId;
    const streamId  = await StreamCollection.findOneByOwner(user);
    const stream = await StreamCollection.moveOneFreetToCapture(streamId._id, req.params.freetId);

    res.status(200).json({
      message: 'Freet successfully captured',
      stream: util.constructStreamResponse(stream)
    });
  }
 );

 router.put(
  '/release/:freetId?',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamExists,
    freetValidator.isFreetExists,
    streamValidator.isFreetInCaptured
  ],
  async (req: Request, res: Response) => {
    const user = req.session.userId;
    const streamId  = await StreamCollection.findOneByOwner(user);
    const stream = await StreamCollection.moveOneFreetToStream(streamId._id, req.params.freetId);

    res.status(200).json({
      message: 'Freet successfully released',
      stream: util.constructStreamResponse(stream)
    });
  }
 );




/**
 * Delete a freet from stream
 */
router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    streamValidator.isStreamExists,
    freetValidator.isFreetExists,
    streamValidator.isFreetInStream
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    let stream = await StreamCollection.findOneByOwner(userId);
    const freet = await FreetCollection.findOne(req.params.freetId);

    stream = await StreamCollection.deleteFreetFromStream(stream._id,freet._id);

    res.status(200).json({
      message: 'The Freet has been deleted from the stream successfully.',
      stream: util.constructStreamResponse(stream)
    });
  }
);
export {router as streamRouter};