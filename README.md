# s3-session-manager

Renews STS assumed role session for S3

## Installation

```
npm install s3-session-manager
```

## Usage
Basic usage:
```ts
import {S3SessionManager} from 's3-session-manager';

const sessionManager = new S3SessionManager({
  roleRequest: {
    RoleArn: 'someRole',
    RoleSessionName: 'SessionName'
  }
});
const s3Client = sessionManager.getClient();
```

Example with CloudHound:
```ts
import {S3Hound} from 'cloudhound';
import {S3SessionManager} from 's3-session-manager';

const sessionManager = new S3SessionManager({
  roleRequest: {
    RoleArn: 'someRole',
    RoleSessionName: 'SessionName'
  }
});
const cloudHound = S3Hound.newQuery({ 
  bucket: 'myBucket', 
  s3Factory: sessionManager 
});

const results = await cloudHound.find();
```

## Test
```
npm test
```

To generate a test coverage report:
```
npm run coverage
```
