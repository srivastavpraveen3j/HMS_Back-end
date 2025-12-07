import mongoose from 'mongoose';
import crypto from 'crypto';

const NamespaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
    },
    contact_email: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
    },
    api_Key: {
        type: String,
        required: [true, 'API KEY is required'],
        unique: true
    },
    database_url: {
        type: String,
        required: [true, 'Primary database URL is required'],
        trim: true,
    },
    backup_database_url: {
        type: String,
        trim: true,
        default: null, // optional, can be empty if user doesn't set it
    },
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    }]
}, { timestamps: true });

// Generate API Key
NamespaceSchema.statics.generateApiKey = function () {
    return crypto.randomBytes(32).toString('hex');
};

export default mongoose.model('Namespace', NamespaceSchema);