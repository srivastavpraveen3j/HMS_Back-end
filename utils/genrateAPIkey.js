import crypto from 'crypto';


export function generateApiKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export default generateApiKey;