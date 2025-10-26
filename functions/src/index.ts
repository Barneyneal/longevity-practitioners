/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";

// Import your existing route handlersnpm run build
import progressHandler from "./api/progress/index";
import progressUpdateHandler from "./api/progress/update";
import resultsCreateHandler from "./api/results/create";
import resultsGetHandler from "./api/results/get";
import submissionsCreateHandler from "./api/submissions/create";
import submissionsMeHandler from "./api/submissions/me";
import usersMeHandler from "./api/users/me";
import usersCreateHandler from "./api/users/create";
import { authenticate } from './middleware/auth';

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// We no longer need the adapter function
// const adaptRequest = (handler: any) => (req: express.Request, res: express.Response) => {
//     return handler(req, res);
// }

// Progress
app.get("/progress", authenticate, progressHandler);
app.post("/progress/update", authenticate, progressUpdateHandler);

// Results
app.post("/results/create", authenticate, resultsCreateHandler);
app.get("/results/get", resultsGetHandler);

// Submissions
app.post("/submissions/create", authenticate, submissionsCreateHandler);
app.get("/submissions/me", authenticate, submissionsMeHandler);

// Users
app.post("/users/create", usersCreateHandler);
app.get("/users/me", authenticate, usersMeHandler);


// Expose Express API as a single Cloud Function
export const api = functions.https.onRequest(app);
