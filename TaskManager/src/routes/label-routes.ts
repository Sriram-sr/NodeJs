import { Router } from 'express';
import {
  getLabels,
  getSingleLabel,
  createLabel,
  updateLabel,
  deleteLabel
} from '../controllers/label-controllers';
import { param } from 'express-validator';
import Label from '../models/Label';

const router = Router();

const labelIdValidator = [
  param('labelId')
    .isMongoId()
    .withMessage('Invalid mongo ID')
    .custom(async value => {
      try {
        const label = await Label.findById(value);
        if (!label) {
          throw new Error('Label not found with this ID');
        }
      } catch (err) {
        throw new Error(
          'Something went wrong, could not complete the request currently'
        );
      }
    })
];

router.route('/').get(getLabels).post(createLabel);
router
  .route('/:labelId')
  .get(labelIdValidator, getSingleLabel)
  .patch(labelIdValidator, updateLabel)
  .delete(labelIdValidator, deleteLabel);

export default router;
