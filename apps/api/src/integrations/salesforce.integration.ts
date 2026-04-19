import {
  ISalesforceOAuthClient,
  PlaceholderTokenVault,
  SalesforceOAuthClient,
  TokenVault
} from '@agentease/salesforce';
import { env } from '../config/env.js';

export function createSalesforceOAuthClient(): ISalesforceOAuthClient {
  return new SalesforceOAuthClient(
    env.SALESFORCE_CLIENT_ID,
    env.SALESFORCE_CLIENT_SECRET,
    env.SALESFORCE_REDIRECT_URI,
    env.SALESFORCE_LOGIN_URL
  );
}

export function createTokenVault(): TokenVault {
  return new PlaceholderTokenVault();
}
