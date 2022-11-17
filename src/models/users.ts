import mongoose from 'mongoose';

export const Users = mongoose.model('users', new mongoose.Schema({
  email: 'string',
  organization: {
    type: 'ObjectId',
    ref: 'organizations',
  }
}));
