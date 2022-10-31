import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Stream, PopulatedStream} from '../stream/model';
import { Freet } from '../freet/model';

// Update this if you add a property to the Freet type!
type StreamResponse = {
  _id: string;
  owner: string;
  streamFreets: Array<Freet>;
  capturedFreets: Array<Freet>;
  maxSize: number;
  refreshTimer: number;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Stream object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Reaction>} stream - A stream
 * @returns {StreamResponse} - The stream object formatted for the frontend
 */
const constructStreamResponse = (stream: HydratedDocument<Stream>): StreamResponse => {
  const streamCopy: PopulatedStream = {
    ...stream.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = streamCopy.ownerId;
  const streamFreetsList = streamCopy.streamFreets.map(x => x);
  const streamCapturedList = streamCopy.capturedFreets.map(x => x);

  delete streamCopy.ownerId;
  delete streamCopy.streamFreets;
  delete streamCopy.capturedFreets;

  return {
    ...streamCopy,
    _id: streamCopy._id.toString(),
    owner: username,
    streamFreets: streamFreetsList,
    capturedFreets: streamCapturedList
  };
};

export {
  constructStreamResponse
};
