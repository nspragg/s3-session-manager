# S3SessionManager

Renews STS assumed role session for S3

## Installation

```
npm install s3SessionManager
```

## Usage
```js
const sessionManager = new S3SessionManager({
  roleRequest: {
    RoleArn: 'someRole',
    RoleSessionName: 'SessionName'
  }
});

const s3Client = sessionManager.getClient(); 
```

## Test
```
npm test
```

To generate a test coverage report:
```
npm run coverage
```
