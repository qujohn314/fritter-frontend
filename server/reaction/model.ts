import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Freet} from '../freet/model';
import type {Comment} from '../comment/model';


/**
 * This file defines the properties stored in a Reaction
 * DO NOT implement operations here ---> use collection file
 */

const reactionTypes = ['Angry','Sad','Wow','Love','Like','Dislike']
export const reactionTypeSet = new Set(reactionTypes);

export type Reaction = {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  itemType: string;
  itemId: Types.ObjectId; //How to specify whether it is a comment or freet ID? 
  dateCreated: Date;
  reactionType: string;
  dateModified: Date;
};

export type PopulatedReaction = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: User;
  itemType: string;
  itemId: string;
  dateCreated: Date;
  reactionType: string;
  dateModified: Date;
};


const ReactionSchema = new Schema<Reaction>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  itemType:{
    type: String,
    required: true,
    enum: ['Freet', 'Comment']
  },
  itemId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  // The date the reaction was created
  dateCreated: {
    type: Date,
    required: true
  },
  dateModified: {
    type: Date,
    required: true
  },
  // The type of the reaction
  reactionType: {
    type: String,
    required: true,
    enum: reactionTypes
  },

});

const ReactionModel = model<Reaction>('Reaction', ReactionSchema);

export default ReactionModel;

