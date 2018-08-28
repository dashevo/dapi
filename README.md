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

## Getting Started

### Installation

DAPI requires [Insight-API](https://github.com/dashevo/insight-api) and the latest version of [Dashcore](https://github.com/dashevo/dash/tree/evo) with evolution features.

1. **Install core.** You can use the docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/dashcore:evo`) or clone code from [the repository](https://github.com/dashevo/dash/tree/evo), switch to the `evo` branch, and build it by yourself.
2. **Configure core.** DAPI needs Dashcore's ZMQ interface to be exposed and all indexes enabled. You can find the example config for Dashcore [here](/doc/dependencies_configs/dash.conf). To start dashcore process with this config, copy it somewhere to your system, and then run `./src/dashd -conf=/path/to/your/config`.
3. **Install Insight-API.** You can use docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/evoinsight:latest`) or install it manually.
    1. To install it manually, clone the [dashcore-node repo](https://github.com/dashevo/dashcore-node). `cd` to that repo, run `npm i`
    2. Install Insight-API service. Run `./bin/dashcore-node install https://github.com/dashevo/insight-api/` from the repo directory
    3. Copy [config file](/doc/dependencies_configs/dashcore-node.json) to the repo directory
    4. Run `./bin/dashcore-node start`  
4. Clone this repo, switch to `develop`, run `npm i`

### Running

After you've installed all the dependencies, you can start DAPI by running `npm start` command inside the DAPI repo directory.

### Configuration

DAPI is configured via environment variables. So, in order to change DAPI port, you need to run `RPC_SERVER_PORT=3010 npm start`. You can see full list of available options [here](/doc/CONFIGURATION.md).

### Making basic requests

DAPI uses JSON-RPC 2.0 as the main interface. If you want to understand that DAPI is functioning and synced, you can request best block height. 
Send following json to your DAPI instance: 
```json
{"jsonrpc": "2.0","method": "getBestBlockHeight"}
```

### Available RPCs

All available RPC commands can be found [here](/lib/rpcServer/commands). 
