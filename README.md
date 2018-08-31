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

DAPI requires [Insight-API](https://github.com/dashevo/insight-api) and the latest version of [dashcore](https://github.com/dashevo/dash/tree/evo) with evolution features.

1. **Install core.** You can use the docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/dashcore:evo`) or clone code from [the repository](https://github.com/dashevo/dash/tree/evo), switch to the `evo` branch, and build it by yourself.
2. **Configure core.** DAPI needs dashcore's ZMQ interface to be exposed and all indexes enabled. You can find the example config for dashcore [here](/doc/dependencies_configs/dash.conf). To start dashcore process with this config, copy it somewhere to your system, and then run `./src/dashd -conf=/path/to/your/config`.
3. **Install Insight-API.** You can use docker image (`103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/evoinsight:latest`) or install it manually.
    1. To install it manually, clone the [dashcore-node repo](https://github.com/dashevo/dashcore-node). `cd` to that repo, run `npm i`
    2. Install Insight-API service. Run `./bin/dashcore-node install https://github.com/dashevo/insight-api/` from the repo directory
    3. Copy [config file](/doc/dependencies_configs/dashcore-node.json) to the repo directory
    4. Run `./bin/dashcore-node start`
4. Clone this repo, switch to `develop`, run `npm i`

### Running

After you've installed all the dependencies, you can start DAPI by running the `npm start` command inside the DAPI repo directory.

### Configuration

DAPI is configured via environment variables. So, in order to change the DAPI port, you need to run `RPC_SERVER_PORT=3010 npm start`. You can see the full list of available options [here](/doc/CONFIGURATION.md).

### Making basic requests

DAPI uses JSON-RPC 2.0 as the main interface. If you want to confirm that DAPI is functioning and synced, you can request the best block height.
Send the following json to your DAPI instance:
```json
{"jsonrpc": "2.0","method": "getBestBlockHeight"}
```

## API Reference

All available RPC commands can be found [here](/lib/rpcServer/commands).

### Table of Contents

[addToBloomFilter](#addToBloomFilter)
[clearBloomFilter]
[estimateFee]
[findDataForBlock]
[Generate]
[getAddressSummary]
[getAddressTotalReceived]
[getAddressTotalSent]
[getAddressUnconfirmedBalance]
[getAuthChallenge]
[getBalance]
[getBestBlockHeight]
[getBlockHash]
[getBlockHeaders]
[getBlocks]
[getCurrency]
[getDapContract]
[getHistoricBlockchainDataSyncStatus]
[getMNList]
[getMnListDiff]
[getMNUpdateList]
[getPeerDataSyncStatus]
[getRawBlock]
[getSpvData]
[getStatus]
[getTransactionById]
[getTransactionsByAddress]
[getUser]
[getUserDapContext]
[getUserDapSpace]
[getUTXO]
[getVersion]
[loadBloomFilter]
[searchDapContracts]
[searchUsers]
[sendRawTransaction]
[sendRawTransition]

### addToBloomFilter

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### clearBloomFilter

clears bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### estimateFee

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### findDataForBlock

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### generate

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAddressSummary

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAddressSummary

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAddressTotalReceived

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAddressTotalSent

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAddressUnconfirmedBalance

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getAuthChallenge

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getBalance

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getBestBlockHeight

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getBlockHash

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getBlockHeaders

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getBlocks

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getCurrency

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getDapContract

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getHistoricBlockchainDataSyncStatus

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getMNList

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getMnListDiff

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getMNUpdateList

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getPeerDataSyncStatus

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getRawBlock

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getSpvData

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getStatus

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getTransactionById

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getTransactionsByAddress

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getUser

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getUserDapContext

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getUserDapSpace

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getUTXO

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### getVersion

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### loadBloomFilter

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### searchDapContracts

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### searchUsers

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### sendRawIxTransaction

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### sendRawTransaction

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |


### sendRawTransition

Adds something to bloom filter

##### Params

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |

##### Response

| name    | type   | description                            |
|---------|--------|----------------------------------------|
| packet  | string | ST Packet object serialized using CBOR |







