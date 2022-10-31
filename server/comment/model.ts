import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Freet} from '../freet/model';

// Type definition for Freet on the backend
export type Comment = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    authorId: Types.ObjectId;
    parentFreetId: Types.ObjectId;
    dateCreated: Date;
    content: string;
    dateModified: Date;
};

export type PopulatedComment = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    authorId: User;
    parentFreetId: Freet;
    dateCreated: Date;
    content: string;
    dateModified: Date;
  };

const CommentSchema = new Schema<Comment>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  parentFreetId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  // The date the freet was created
  dateCreated: {
    type: Date,
    required: true
  },
  // The content of the freet
  content: {
    type: String,
    required: true
  },
  // The date the freet was modified
  dateModified: {
    type: Date,
    required: true
  }
});

const CommentModel = model<Comment>('Comment', CommentSchema);
export default CommentModel;
  