import {S3, STS} from 'aws-sdk';
// tslint:disable-next-line:no-submodule-imports
import {ClientConfiguration} from 'aws-sdk/clients/s3';

interface S3FactorySessions {
  shouldRefreshCredentials?: boolean;
  s3Client?: S3;
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000;

export interface SessionParams {
  roleRequest: STS.AssumeRoleRequest;
  sts?: STS;
  credentialsTimeout?: number;
}

export class S3SessionManager {
  private readonly sessions: S3FactorySessions;
  private sts: STS;
  private readonly timeoutInMS: number;
  private readonly roleRequest: STS.AssumeRoleRequest;

  constructor(params: SessionParams) {
    this.sessions = {};
    this.roleRequest = params.roleRequest;
    this.sts = params.sts || new STS();
    this.timeoutInMS = params.credentialsTimeout || DEFAULT_TIMEOUT;
  }

  async getClient(): Promise<S3> {
    const session = this.getSession(this.roleRequest);

    if (!session.shouldRefreshCredentials && session.s3Client) {
      return session.s3Client;
    }

    const credentials = await this.getCredentials(this.roleRequest);
    session.s3Client = new S3(this.toClientConf(credentials));
    session.shouldRefreshCredentials = false;

    const timeout = this.timeoutInMS;
    setTimeout(() => {
      session.shouldRefreshCredentials = true;
    }, timeout);

    return session.s3Client;
  }

  private toClientConf(opts: STS.Credentials): ClientConfiguration {
    return {
      accessKeyId: opts.AccessKeyId,
      secretAccessKey: opts.SecretAccessKey,
      sessionToken: opts.SessionToken
    };
  }

  private async getCredentials(opts: STS.AssumeRoleRequest): Promise<STS.Credentials> {
    let Credentials;

    try {
      ({Credentials} = await this.sts.assumeRole(opts).promise());
    } catch (error) {
      throw error;
    }

    return Credentials;
  }

  private getSession(opts: STS.AssumeRoleRequest): S3FactorySessions {
    const {RoleSessionName} = opts;
    let session = this.sessions[RoleSessionName];

    if (!session) {
      session = {
        shouldRefreshCredentials: true,
        s3Client: null
      };
    }

    this.sessions[RoleSessionName] = session;

    return session;
  }
}
