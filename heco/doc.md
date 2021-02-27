0.psql 数据库启动
pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start


1.启动chainlink-test
cd /Users/xuxinlai/ela/ethWatcher/test/.chainlink-test
./startTestChainlink.sh

2.进入chainlink 后台
http://localhost:6688/

3.部署合约(已部署此步骤可以跳过)
/Users/xuxinlai/ela/ethWatcher/test/doGetDataWork/DataConsumer.sol
0x268003344eE35e83f8769D89F6e0046518b82CaF

4.运行web3
cd /Users/xuxinlai/ela/ethWatcher/test/callGetDataWork
.获得btc 余额
node runBalance.js
.获得btc 时间戳
node runTimespan.js




