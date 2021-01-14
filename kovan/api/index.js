const DataConsumer = require('../../regest/callGetDataWork/contracts/DataConsumer.json');

// 需要参数化
const config = require('./config.json');
const privateKey = config["privateKey"];
const oracle = config["oracle"];
const jobID = config["jobID"];
const ContractAddress = config["contractAddress"];

const httpUrl = config["httpUrl"];
const ws = config["wsUrl"];

const Web3 = require('web3');
const web3Http = new Web3(httpUrl);
var curBtcAddress = "";
var retVal = 0;

const Run = new web3Http.eth.Contract(DataConsumer.abi, ContractAddress, {
  gasPrice: 1000000000, // 1gwei
  gasLimit: 8000000,
});

//btc balance
const watchBtcBalanceChainRequest = (callback) =>{

  console.log("watch btc chain balance");

  //var web3Obj = new Web3(ws);
  const web3Obj = new Web3()
  const provider = new Web3.providers.WebsocketProvider(ws);
  web3Obj.setProvider(provider);

  const dataConsumerContract = new web3Obj.eth.Contract(DataConsumer.abi, ContractAddress, {
    gasPrice: 1000000000, // 1gwei
    gasLimit: 4000000,
  });

  dataConsumerContract.events.RequestBtcBalanceFulfilled({
  }, function(err, data) {

      provider.disconnect();
     
      const retVal = parseInt(data.returnValues["1"])
      const retReponse = {
        data:retVal
      }
      callback(200,retReponse);
    
  });

}

const watchBtcTimespanChainRequest = (callback) =>{

  console.log("watch btc chain timespan");

  //var web3Obj = new Web3(ws);
  const web3Obj = new Web3()
  const provider = new Web3.providers.WebsocketProvider(ws);
  web3Obj.setProvider(provider);
  
  const dataConsumerContract = new web3Obj.eth.Contract(DataConsumer.abi, ContractAddress, {
    gasPrice: 1000000000, // 1gwei
    gasLimit: 4000000,
  });

  dataConsumerContract.events.RequestBtcTimespanFulfilled({
  }, function(err, data) {

      provider.disconnect();
     
      const retVal = parseInt(data.returnValues["1"])
      const retReponse = {
        data:retVal
      }
      callback(200,retReponse);
      
  });

}

const watchBtcScoreChainRequest = (address,callback) =>{

  console.log("###0 watch btc chain score");
  console.log("###curBtcAddress " + curBtcAddress + " address " + address);
  if(curBtcAddress == address){
    console.log("###return duplicate call \n");
    return;
  }
  curBtcAddress = address;
  console.log("-->1 come to real call\n");


  //var web3Obj = new Web3(ws);
  const web3Obj = new Web3()
  const provider = new Web3.providers.WebsocketProvider(ws);
  web3Obj.setProvider(provider);
  
  const dataConsumerContract = new web3Obj.eth.Contract(DataConsumer.abi, ContractAddress, {
    gasPrice: 1000000000, // 1gwei
    gasLimit: 4000000,
  });

  callGetDataWork(address,0);

  dataConsumerContract.events.RequestBtcScoreResult({
  }, function(err, data) {

      provider.disconnect();

      curBtcAddress = "";
      retVal = 0;
      //console.log(data.returnValues);
      retVal = parseInt(data.returnValues["0"])

      const retReponse = {data:retVal}
      callback(200,retReponse);




    
  });

}


//async function callGetDataWork(nTpye) {
const callGetDataWork = async (address,nType) => {

  var transaction = getCallMethod(address,nType);
  const account = web3Http.eth.accounts.privateKeyToAccount(privateKey);

  const options = {
      to      : transaction._parent._address,
      data    : transaction.encodeABI(),
      gas     : await transaction.estimateGas({from: account.address}),
      gasPrice: await web3Http.eth.getGasPrice() // or use some predefined value
  };


  const signed  = await web3Http.eth.accounts.signTransaction(options, privateKey);
  const receipt = await web3Http.eth.sendSignedTransaction(signed.rawTransaction);
  //console.log(receipt);

};


function getCallMethod(address,nType){

  var transaction;

  //RequestBtcScore 0
  if(nType == 0){ 
    transaction = Run.methods.RequestBtcScore(
      oracle,
      jobID,
      address
    );
  //RequestBtcBalance 1  
  }else if(nType == 1){
    transaction = Run.methods.RequestBtcBalance(
      oracle,
      jobID,
      address
    );
  //RequestBtcTimespan 2    
  }else if(nType == 2){
    transaction = Run.methods.RequestBtcTimespan(
      oracle,
      jobID,
      address
    );
  //RequestEthScore 3    
  }else if(nType == 3){
    //TODO
  //RequestEthBalance 4   
  }else if(nType == 4){
    transaction = Run.methods.RequestEthBalance(
      oracle,
      jobID,
      address
    );
  //RequestEthTimespan 5   
  }else if(nType == 5){
    transaction = Run.methods.RequestEthTimespan(
      oracle,
      jobID,
      address
    );
  }

  return transaction;

}


const watchEthBalanceChainRequest = (callback) =>{

  console.log("watch eth chain balance");

  //var web3Obj = new Web3(ws);
  const web3Obj = new Web3()
  const provider = new Web3.providers.WebsocketProvider(ws);
  web3Obj.setProvider(provider);

  const dataConsumerContract = new web3Obj.eth.Contract(DataConsumer.abi, ContractAddress, {
    gasPrice: 1000000000, // 1gwei
    gasLimit: 4000000,
  });

  dataConsumerContract.events.RequestEthBalanceFulfilled({
  }, function(err, data) {

      provider.disconnect();
     
      console.log(data);

      const retVal = data.returnValues["1"]
      const retReponse = {
        data:retVal
      }
      callback(200,retReponse);
    
  });

}

const watchEthTimespanChainRequest = (callback) =>{

  console.log("watch eth chain timespan");

  //var web3Obj = new Web3(ws);
  const web3Obj = new Web3()
  const provider = new Web3.providers.WebsocketProvider(ws);
  web3Obj.setProvider(provider);
  
  const dataConsumerContract = new web3Obj.eth.Contract(DataConsumer.abi, ContractAddress, {
    gasPrice: 1000000000, // 1gwei
    gasLimit: 4000000,
  });

  dataConsumerContract.events.RequestEthTimespanFulfilled({
  }, function(err, data) {

      provider.disconnect();
     
      const retVal = parseInt(data.returnValues["1"])
      const retReponse = {
        data:retVal
      }
      callback(200,retReponse);
      
      
  });

}


// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}


module.exports.watchBtcBalanceChainRequest =  watchBtcBalanceChainRequest
module.exports.watchBtcTimespanChainRequest = watchBtcTimespanChainRequest

module.exports.watchEthBalanceChainRequest =  watchEthBalanceChainRequest
module.exports.watchEthTimespanChainRequest = watchEthTimespanChainRequest

module.exports.watchBtcScoreChainRequest = watchBtcScoreChainRequest