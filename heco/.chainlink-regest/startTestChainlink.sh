#!/bin/sh

docker run -p 6600:6688 --name regest-cl -v ~/ela/ethWatcher/regest/.chainlink-regest:/chainlink -it --env-file=.env smartcontract/chainlink:0.9.5 local n 