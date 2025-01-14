import { NextApiRequest, NextApiResponse } from "next";
import { sendRecoveryEmail } from "../../src/lib/mail/mail";
import {
    ERROR_RECOVERY_LINK_EXPIRED,
    FAILED_PASSWORD_CHANGED,
    MISSING_BODY,
    PASSWORD_CHANGED,
    PASSWORD_REQUIREMENTS,
    RECOVERY_REQUEST_FULFILLED,
    RECOVERY_SUCCESS,
} from "../../src/lib/messages";
import { isValidDelay, onError, onSuccess } from "../../src/lib/utils";
import {
    generateSecrets,
    getUserFromEmail,
    getUserFromId,
    updateUser,
    updateUserRecoveryHash,
} from "../../src/server/service/user-service";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "POST": // when submitting email recovery form
            return postMethod(req.body, res);
        case "PATCH": // when submitting new password form
            return patchMethod(req.body, res);
    }
}

async function postMethod(body: any, res: NextApiResponse) {
    if (!body || !body.email) {
        return onError(res, 400, MISSING_BODY);
    }

    const user = await getUserFromEmail(body.email);
    if (!user) {
        // don't tell the user if the email is registered or not
        return onSuccess(res, 200, RECOVERY_REQUEST_FULFILLED, null);
    }

    const recoverHash = await updateUserRecoveryHash(user.id);

    sendRecoveryEmail(user.id, user.email, recoverHash);
    return onSuccess(res, 200, RECOVERY_REQUEST_FULFILLED, null);
}

async function patchMethod(body: any, res: NextApiResponse) {
    try {
        if (!body || !body.password || !body.userId || !body.recoverHash) {
            return onError(res, 400, MISSING_BODY);
        }

        if (body.password.length < 8) {
            return onError(res, 400, PASSWORD_REQUIREMENTS);
        }

        const userId = +body.userId!;
        const recoverHash = body.recoverHash;
        const user = await getUserFromId(userId, true);

        if (
            !user ||
            recoverHash !== user.secrets.recoverHash ||
            isValidDelay(user.secrets.lastRecoverHash, 60)
        ) {
            return onError(res, 500, ERROR_RECOVERY_LINK_EXPIRED);
        }

        const secrets = generateSecrets(body.password);
        if (!secrets) {
            return onError(res, 500, FAILED_PASSWORD_CHANGED);
        }

        const updated = await updateUser({
            id: { id: user.id },
            secrets: {
                hash: secrets.hash,
                salt: secrets.salt,
                recoverHash: secrets.recoverHash,
                lastRecoverHash: secrets.lastRecoverHash,
            },
        });

        if (!updated) {
            return onError(res, 500, FAILED_PASSWORD_CHANGED);
        }

        return onSuccess(res, 200, RECOVERY_SUCCESS, null);
    } catch (error: any) {
        return onError(res, 500, FAILED_PASSWORD_CHANGED);
    }
}
