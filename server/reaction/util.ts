import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Reaction, PopulatedReaction} from '../reaction/model';

// Update this if you add a property to the Freet type!
type ReactionResponse = {
  _id: string;
  author: string;
  itemType: string;
  itemId: string;
  dateCreated: string;
  dateModified: string;
  reactionType: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Reaction object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Reaction>} reaction - A reaction
 * @returns {ReactionResponse} - The reaction object formatted for the frontend
 */
const constructReactionResponse = (reaction: HydratedDocument<Reaction>): ReactionResponse => {
  const reactionCopy: PopulatedReaction = {
    ...reaction.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = reactionCopy.authorId;
  delete reactionCopy.authorId;

  return {
    ...reactionCopy,
    _id: reactionCopy._id.toString(),
    author: username,
    dateCreated: formatDate(reaction.dateCreated),
    dateModified: formatDate(reaction.dateModified)
  };
};

export {
  constructReactionResponse
};
