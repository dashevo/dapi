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

## Table of Content
- [Getting Started](#getting-started)
    - [Installation](#installation)

## Getting Started

### Installation

DAPI requires [Insight-API](https://github.com/dashevo/insight-api) and the latest version of [Dashcore](https://github.com/dashevo/dash/tree/evo) with evolution features.

1. **Install core.** You can use the [docker image](103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/dashcore:evo) or clone code from [the repository](https://github.com/dashevo/dash/tree/evo), switch to the `evo` branch, and build it by yourself.
2. **Configure core.** DAPI needs Dashcore's ZMQ interface to be exposed and all indexes enabled. You can find the example config for Dashcore [here](/doc/dependencies_configs/dash.conf). To start dashcore process with this config, copy it somewhere to your system, and then run `./src/dashd -conf=/path/to/your/config`.
3. **Install Insight-API.** You can use [docker image]() or clone the [repo]().
4. **Configure Insight-API.**

### Configuration

### Running
