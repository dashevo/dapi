/* istanbul ignore next */

/**
* This file is used by swagger-jsdoc as the root document object of the
* OpenAPI document (https://swagger.io/specification/#oasObject).
*
* The file is only used as input to the swagger-jsdoc CLI application when
* generating the OAS API documentation (`swagger-jdsoc -d <this-file> ...`).
*/

module.exports = {
  "openapi": "3.0.0",
  "x-api-id": "dapi-devnet",
  info: {
    // API informations (required)
    title: 'DAPI devnet',
    version: '0.1.0',
    description: 'The Dash decentralized API',
  },
  servers: [
    {
    "url": "http://devnet-maithai.thephez.com:3000"
    },
  ],
  //basePath: '/', // Base path (optional)
  "paths": {},
  "components": {
    "schemas": {
      "JsonRpcRequired": {
        "type": "object",
        "required": [
          "id",
          "jsonrpc"
        ],
        "properties": {
          "id": {
            "type": "integer",
            "default": 1,
            "format": "int32",
            "description": "Request ID"
          },
          "jsonrpc": {
            "type": "string",
            "default": "2.0",
            "description": "JSON-RPC Version (2.0)"
          }
        },
        "discriminator": {
          "propertyName": "method_name"
        }
      }
    }
  },
  /** Readme.io swagger extensions
  * ------------------------------
  *
  * x-send-defaults (default: false)
  * - Whether to send the defaults specified in your swagger file, or render
  *   them as placeholders
  */
  "x-send-defaults": true,
  /**
  * x-headers (default: undefined)
  * - Array of static headers to add to each request. Must be provided as an
  *   array of JSON objects with `key` and `value` properties.
  */
  "x-headers": [],
  /**
  * x-explorer-enabled (default: true)
  * - Enable the API explorer
  */
  "x-explorer-enabled": true,
  /**
  * x-proxy-enabled (default: true)
  * - Whether the Readme CORs proxy is enabled or not. If your API correctly
  *   returns CORs headers, you can safely turn this off.
  */
  "x-proxy-enabled": true,
  /**
  * x-samples-enabled (default: true)
  * - Enable code examples
  */
  "x-samples-enabled": true,
  /**
  * x-samples-language
  * - Languages to generate code samples for
  * Default: ['curl', 'node', 'ruby', 'javascript', 'python']
  * Supported: node, curl, ruby, javascript, objectivec, python, java, php, csharp, swift, go
  */
  "x-samples-languages": [
    "curl",
    "node",
    "ruby",
    "javascript",
    "python"
  ]
};
