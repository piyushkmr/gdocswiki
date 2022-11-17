import mongoose from 'mongoose';

export const Organizations = mongoose.model('organizations', new mongoose.Schema({
  displayName: 'string',
  chosenUrl: 'string',
  ownerDomain: 'string',
  displayImage: 'string',
  oauthClientId: 'string',
  oauthClientSecret: 'string',
}));
