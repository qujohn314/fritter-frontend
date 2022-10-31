import { Freet, FreetSchema } from '../freet/model';
import {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

export const defaultSize: number = 10;
export const defaultTimer: number = 20;

export type Stream = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: Types.ObjectId;
  streamFreets: Types.DocumentArray<Freet>;
  capturedFreets: Types.DocumentArray<Freet>;
  maxSize: number;
  refreshTimer: number;
};

export type PopulatedStream = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: User;
  streamFreets: Types.DocumentArray<Freet>;
  capturedFreets: Types.DocumentArray<Freet>;
  maxSize: number;
  refreshTimer: number;
};


const StreamSchema = new Schema<Stream>({
  // The owner userId
  ownerId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  streamFreets: {
    type: [FreetSchema],
    required: true
  },
  capturedFreets: {
    type: [FreetSchema],
    required: true
  },
  maxSize:{
    type: Number,
    required: true
  },
   refreshTimer:{
    type: Number,
    required: true
  }
});

const StreamModel = model<Stream>('Stream', StreamSchema);
export default StreamModel;
