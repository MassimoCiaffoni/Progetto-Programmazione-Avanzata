// Import libraries
import * as JwtMiddleware from './middlewareJwt';
import * as errorHandler from './ErrorHandler';
import * as valMiddleware from './middlewareVal';


/**
 * Chains of Responsability to call middlewares 
 * 
 * The following chains define which middleware layers and in what order 
 * must be checked for the HTTP request to reach the controller
 */

 export const jwt = [
    JwtMiddleware.checkHeader,
    JwtMiddleware.checkToken,
    JwtMiddleware.verifyAndAuthenticate,
    errorHandler.errorHandler
]

export const jwtPayload = [
    JwtMiddleware.checkJwtPayload,
    errorHandler.errorHandler
]

export const checkAdmin = [
    valMiddleware.ChargeUserVal,
    errorHandler.errorHandler
]

export const checkGame = [
    valMiddleware.GameVal,
    valMiddleware.PlayersVal,
    errorHandler.errorHandler
]

export const checkGameExistence = [
    valMiddleware.GameExistence,
    errorHandler.errorHandler
]