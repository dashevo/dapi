<h1 align="center">DAPI</h1>

<div align="center">
  <strong>A Dash decentralized API</strong>
</div>
<br />
<div align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- Build Status -->
  <a href="https://travis-ci.com/dashevo/dapi">
    <img src="https://img.shields.io/travis/dashevo/dapi/master.svg?style=flat-square" alt="Build Status" />
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/dapi">
    <img src="https://img.shields.io/npm/v/dapi.svg?style=flat-square" alt="NPM version" />
  </a>
</div>

## Contents
- [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Running](#running)
    - [Configuration](#configuration)
    - [Making requests](#making-basic-requests)
- [API Reference](#api-reference)

## Getting Started

### Installation

DAPI is targeted to work with the LTS node.js. At the moment this is node 8.

DAPI requires [Insight-API](https://github.com/dashevo/insight-api) and the latest version of [dashcore](https://github.com/dashevo/dash/tree/evo) with evolution features.

1. **Install core.** You can use the docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/dashcore:evo`) or clone code from [the repository](https://github.com/dashevo/dash/tree/evo), switch to the `evo` branch, and build it by yourself. Note: you need to build image with ZMQ and wallet support. You can follow the build instructions located [here](https://github.com/dashevo/dash/tree/evo/doc)
2. **Configure core.** DAPI needs dashcore's ZMQ interface to be exposed and all indexes enabled. You can find the example config for dashcore [here](/doc/dependencies_configs/dash.conf). To start dashcore process with this config, copy it somewhere to your system, and then run `./src/dashd -conf=/path/to/your/config`.
3. **Install Insight-API.** You can use docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/evoinsight:latest`) or install it manually.
    1. To install it manually, clone the [dashcore-node repo](https://github.com/dashevo/dashcore-node). `cd` to that repo, run `npm i`
    2. Copy [config file](/doc/dependencies_configs/dashcore-node.json) to the repo directory
    3. Install Insight-API service. Run `./bin/dashcore-node install https://github.com/dashevo/insight-api/` from the repo directory
    4. Run `./bin/dashcore-node start`
4. Clone this repo, switch to `develop`
5. Right now DAPI has some dependencies that are private to @dashevo org on npm. You will need an npm user that has 
    a read access to this packages. You can go two different ways from here:
        1. Register an npm user. 
            - Ask someone with access to the @dashevo org to add you to that organization on npm
            - Follow [the guide on npm tokens](https://docs.npmjs.com/getting-started/working_with_tokens) to obtain a read-only token
        2. Ask someone who has an access to @dashevo org to give you a read-only token
6. Follow [the guide on using npm tokens for deploys](https://docs.npmjs.com/private-modules/ci-server-config)    
7. Run `npm i`
    
### Running

After you've installed all the dependencies, you can start DAPI by running the `npm start` command inside the DAPI repo directory.

### Configuration

DAPI is configured via environment variables. So, in order to change the DAPI port, you need to run `RPC_SERVER_PORT=3010 npm start`. You can see the full list of available options [here](/doc/CONFIGURATION.md).

### Making basic requests

DAPI uses [JSON-RPC 2.0](https://www.jsonrpc.org/specification) as the main interface. If you want to confirm that DAPI is functioning and synced, you can request the best block height. 
Send the following json to your DAPI instance: 
```json
{"jsonrpc": "2.0","method": "getBestBlockHeight", "id": 1}
```
Note that you always need to specify an id, otherwise the server will respond you with an empty body, as mentioned in the [spec](https://www.jsonrpc.org/specification#notification). 

## API Reference

A list of all available RPC commands, along with their various arguments and expected responses can be found [here](/doc/REFERENCE.md)

Implementation of these commands can be viewed [here](/lib/rpcServer/commands).







