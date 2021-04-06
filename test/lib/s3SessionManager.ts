import * as AWS from 'aws-sdk';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {S3SessionManager} from '../../src/lib/s3SessionManager';

const sandbox = sinon.createSandbox();

AWS.config.update({region: 'eu-west-1'});

async function delay(ms: number): Promise<void> {
  // tslint:disable-next-line:no-string-based-set-timeout
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('S3SessionManager', () => {
  let sessionManager;
  let stsClient;
  let stsClientStub;

  beforeEach(() => {
    stsClient = new AWS.STS();
    sessionManager = new S3SessionManager({
      roleRequestArn: 'someRole',
      sessionName: 'SessionName',
      credentialsTimeout: 1000,
      sts: stsClient
    });

    stsClientStub = sandbox.stub(stsClient, 'assumeRole').returns({
      promise: async () => {
        return {
          Credentials: {
            accessKeyId: 'AccessKeyId',
            secretAccessKey: 'SecretAccessKey',
            sessionToken: 'SessionToken'
          }
        };
      }
    });
  });

  it('returns an S3 instance', async () => {
    const instance = await sessionManager.getClient();
    assert.instanceOf(instance, AWS.S3);
  });

  it('returns an S3 instance with new credentials', () => {
    sessionManager.getClient();
    sinon.assert.calledOnce(stsClientStub);
  });

  it('returns client for the current session', async () => {
    await sessionManager.getClient();
    await delay(250);
    await sessionManager.getClient();
    await delay(250);
    await sessionManager.getClient();
    await delay(250);
    await sessionManager.getClient();
    sinon.assert.calledOnce(stsClientStub);
  });

  it('returns client when current session expires', async () => {
    const sm = new S3SessionManager({
      roleRequestArn: 'someRole',
      sessionName: 'SessionName',
      credentialsTimeout: 500,
      sts: stsClient
    });

    await sm.getClient();
    await delay(250);
    await sm.getClient();
    await delay(250);
    await sm.getClient();
    await delay(250);
    await sm.getClient();
    sinon.assert.calledTwice(stsClientStub);
  });

  it('does not assume role if no role is given', async () => {
    const sm = new S3SessionManager({
      sessionName: 'SessionName'
    });
    const client = await sm.getClient();
    assert.instanceOf(client, AWS.S3);
  });
});
