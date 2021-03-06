# incli
a light wrapper for yargs to streamline cli creation - node

Example usage:

```js
#!/usr/bin/env node

const incli = require('incli');
const path = require('path');
const fs = require('fs');

const log = console.log;
const respond = console.log;

const commands = {
  run: {
    description: 'run a lambda api wrapped handler',
    options: [
      { option: 'path', alias: 'p', describe: 'path to the lambda wrapped handler file', default: null },
      { option: 'formData', alias: 'f', describe: 'JSON object, representing url-encoded form data to send', default: null },
      { option: 'jsonData', alias: 'j', describe: 'JSON object, representing json-encoded form data to send', default: null },
      { option: 'multipartData', alias: 'm', describe: 'JSON object, representing multipart-form-data to send', default: null },
    ],
    callback: async (args) => {
      const { path: filePath } = args
      const cwd = process.cwd();
      const absolutePath = path.resolve(cwd, filePath);
      const relativePath = path.relative(__dirname, absolutePath);
      if (fs.existsSync(`${absolutePath}.js`)) {
        const { handler } = require(relativePath);
        if (!handler) { throw new Error(`${filePath}.js is not exporting the underlying handler. Please make sure \`handler\` is being properly exported.`)}
        const params = { log, respond, verbose: true };
        if (args.formData) {
          try {
            params.formData = JSON.parse(args.formData);
          } catch (e) {
            console.error(e)
            throw new Error(`formData improperly formatted. Must be valid JSON.`)
          }
        }
        return handler(params)
      }
      throw new Error(`${filePath}.js does not exist`);
    },
  },
};

incli(commands);
```
