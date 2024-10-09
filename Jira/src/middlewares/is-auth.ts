import { Request, RequestHandler } from 'express';
import { HttpStatus, errorHandler } from '../utils/error-handlers';
import { TokenExpiredError, verify } from 'jsonwebtoken';
import { JWT_SECURE_KEY } from '../utils/constants';
import { UserDocument } from '../models/User';

export interface customRequest extends Request {
    userId?: UserDocument;
    email?: string;
}

const isAuthenticated: RequestHandler = (req: customRequest, _, next) => {
    const [bearer, token] = req.headers.authorization?.split(' ') || [];
    if (!bearer || bearer !== 'Bearer' || !token) {
        return errorHandler(
            'Authentication headers not found',
            HttpStatus.UNAUTHORIZED,
            next
        );
    }
    try {
        const decodedToken = verify(token, JWT_SECURE_KEY) as {
            _id: UserDocument;
            email: string;
        };
        if (!decodedToken) {
            return errorHandler(
                'JWT token may be invalid or expired',
                HttpStatus.UNAUTHORIZED,
                next
            );
        }
        req.userId = decodedToken._id;
        req.email = decodedToken.email;
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return errorHandler('JWT token expired', HttpStatus.UNAUTHORIZED, next);
        }
        errorHandler(
            'Something went wrong, could not process this request',
            HttpStatus.INTERNAL_SERVER_ERROR,
            next,
            err
        );
    }
    next();
};

export default isAuthenticated;