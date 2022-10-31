import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import CommentCollection from '../comment/collection';
import FreetCollection from '../freet/collection';

/**
 * Checks if a comment with commentId is req.params exists
 */
const isCommentExists = async (req: Request, res: Response, next: NextFunction) => {
  let commentId = req.params.commentId ? req.params.commentId : String(req.query.commentId);
  console.log(req.query);
  if(commentId == undefined || commentId == "undefined"){
    commentId = req.body.itemId ? String(req.body.itemId) : String(req.query.itemId);
  }
  console.log(commentId);
  const validFormat = Types.ObjectId.isValid(commentId);
  const comment = validFormat ? await CommentCollection.findOne(commentId) : '';
  if (!comment) {
    res.status(404).json({
      error: {
        CommentNotFound: `Comment with comment ID ${commentId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a comment of parentFreet with parentFreetId is req.params exists
 */
 const isParentExists = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isparent");
    if (!req.params.parentFreetId || req.params.parentFreeId == "undefined") {
        res.status(400).json({
        error: 'Provided freetId must be nonempty.'
        });
        return;
    }

    const validFormat = Types.ObjectId.isValid(req.params.parentFreetId);

    const freet = validFormat ? await FreetCollection.findOne(req.params.parentFreetId) : '';
    if (!freet) {
      res.status(404).json({
        error: {
          ParentFreetNotFound: `Parent Freet with freet ID ${req.params.parentFreetId} does not exist. Must comment to a valid freet.`
        }
      });
      return;
    }
  
    next();
  };

/**
 * Checks if the content of the comment in req.body is valid, i.e not a stream of empty
 * spaces and not more than 280 characters
*/
const isValidCommentContent = (req: Request, res: Response, next: NextFunction) => {
const {content} = req.body as {content: string};
if (!content.trim()) {
    res.status(400).json({
    error: 'Comment content must be at least one character long.'
    });
    return;
}

if (content.length > 280) {
    res.status(413).json({
    error: 'Comment content must be no more than 280 characters.'
    });
    return;
}


next();
};

/**
 * Checks if the current user is the author of the comment whose commentId is in req.params
 */
 const isValidCommentModifier = async (req: Request, res: Response, next: NextFunction) => {
  const comment = await CommentCollection.findOne(req.params.commentId);
  const userId = comment.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' comments.'
    });
    return;
  }

  next();
};

export {
    isValidCommentContent,
    isCommentExists,
    isParentExists,
    isValidCommentModifier
};