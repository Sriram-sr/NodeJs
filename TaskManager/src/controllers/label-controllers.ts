import { RequestHandler } from 'express';
import Label, { LabelDocument } from '../models/Label';
import {
  HTTP_STATUS,
  errorHandler,
  checkValidationErrors
} from '../utils/error-handlers';
import { validationResult } from 'express-validator';

// @route    GET /api/v1/label/
// @desc     Gets all the labels
// @access   Public
export const getLabels: RequestHandler = (_, res, next) => {
  Label.find()
    .then(labels => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully fetched labels',
        labels
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not get the labels currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    GET /api/v1/label/:labelId
// @desc     Gets single label
// @access   Public
export const getSingleLabel: RequestHandler = (req, res, next) => {
  const { labelId } = req.params as { labelId: string };
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    checkValidationErrors(next, validationErrors.array());
  }

  Label.findById(labelId)
    .then(label => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully fetched the label',
        label
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not get the label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    POST /api/v1/label/
// @desc     Creates a label
// @access   Public
export const createLabel: RequestHandler = (req, res, next) => {
  const { labelName, description, color } = req.body as LabelDocument;
  Label.create({
    labelName,
    description,
    color
  })
    .then(newLabel => {
      res.status(HTTP_STATUS.CREATED).json({
        message: 'Successfully created the label',
        newLabel
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not create the label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    PATCH /api/v1/label/:labelId
// @desc     Updates single label
// @access   Public
export const updateLabel: RequestHandler = (req, res, next) => {
  const { labelId } = req.params as { labelId: string };
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    checkValidationErrors(next, validationErrors.array());
  }

  Label.findByIdAndUpdate(labelId, req.body, { new: true })
    .then(updatedLabel => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully updated the label',
        updatedLabel
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not update label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    DELETE /api/v1/label/:labelId
// @desc     Deletes single label
// @access   Public
export const deleteLabel: RequestHandler = (req, res, next) => {
  const { labelId } = req.params as { labelId: string };
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    checkValidationErrors(next, validationErrors.array());
  }

  Label.findById(labelId)
    .then(label => {
      return label?.deleteOne();
    })
    .then(() => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully deleted the label'
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not delete label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};
