const sd = require("silly-datetime");
var bignum = require('bignum');
const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const createRequest = (input, callback) => {

  getBtcBalance(input.btcAddress ,(btcBalance) => {

    getEthBalance(input.ethAddress,(ethBalance) =>{

      const retReponse = {
          status:200,
          data:[btcBalance,ethBalance]
      }
      callback(200, retReponse)

    });

  })

}

//btc
const createBtcRequest = (address, callback) => {
  
  getBtcBalance(address ,(btcBalance) => {
    
    const retReponse = {
        data:btcBalance
    }
    callback(200, retReponse)
  });

}

///eth
const createEthRequest = (address, callback) => {
  
  getEthBalance(address ,(ethBalance) => {
    
    const retReponse = {
        data:ethBalance
    }
    callback(200, retReponse)
  });

}

//btc
const getBtcBalance = (btcAddress,callback)  => {

  const url = `https://chain.api.btc.com/v3/address/${btcAddress}`

  Requester.request(url, customError)
    .then(response => {
      callback(response.data["data"]["balance"]);
    })
    .catch(error => {
      console.log("get btc balance error :");
      console.log(error);
      callback(-1);
    })
}

///eth
const getEthBalance = (ethAddress,callback) =>{

  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C`

  Requester.request(url, customError)
    .then(response => {
      result = response.data["result"];
      callback(result);
    })
    .catch(error => {
      console.log("get eth balance error :");
      console.log(error);
      callback(-1);
    })

}

//btc
const createBtcRawaddr = async (address, callback) => {
  

  requestJson = {};
  offset = 1 ;
  doCall = true;
  pageSize = 50;
  timeSpanLength = 10;

  while (doCall) {

    requestJson = await RequstForBtcRawaddr(address,offset);
    offset ++;
    
    //call all the data
    if(offset * pageSize > requestJson["txCnt"]){
      doCall = false
    }

    //cath error
    if(requestJson["timespan"] == 0){
      doCall = false
    }

    //find the data
    if(requestJson["timespan"].toString().length == timeSpanLength ){
      doCall = false
    }

  }

  const retReponse = {
    data:requestJson["timespan"]
  }

  if(requestJson["timespan"] == 0){
    callback(500, retReponse)
  }else{
    callback(200, retReponse)
  }

}

const RequstForBtcRawaddr = async (btcAddress,offset) =>{

  retTimespan = 0
  n_tx = 0
  const url = "https://chain.api.btc.com/v3/address/" + btcAddress + "/tx?page=" + offset
  final_balance =  await getBtcBalanceAsync(btcAddress);

  await Requester.request(url, customError)
  .then(response => {
    
    txs = response["data"]["data"]["list"];
    n_tx = response["data"]["data"]["total_count"];

    if(final_balance == -1){
      console.log("btc balance is not correct");
    }
    retTimespan = getHistoryBalanceTime(txs,final_balance,btcAddress,0);

  })
  .catch(error => {
    console.log("get eth balance error :");
    console.log(error);
    return {timespan:0,txCnt:0};
   
  })

  return {timespan:retTimespan,txCnt:n_tx};

}

//getTimeSpan
//type 0 btc;1 eth
const getHistoryBalanceTime = (txs,balance,address,type) =>{

  curBalance = balance;
  isFirstCondtion = false;
  isSecendCondtion = false;
  timeSpan = 0;
  indexConditon = 0;

  for(var index = 0 ;index < txs.length ;index ++ ){

      if(curBalance < balance){
          isSecendCondtion = true;
      }

      if(isFirstCondtion && isSecendCondtion ){
          indexConditon = index;
          break;
      }

      if(curBalance >= balance){
          isFirstCondtion = true
      }else{
          isFirstCondtion = false
      }

      if(type == 0){ //btc
        var retVal = getValue(txs[index],address);
        curBalance = curBalance - retVal
      }else if(type == 1){ //eth

        if(txs[index]['from'].toLowerCase() == address.toLowerCase()){
          curBalance = curBalance.add(txs[index]["value"])
        }else{
          curBalance = curBalance.sub(txs[index]["value"])
        }
      }else{
        console.log("type error:now only support btc and eth");
      }
  }
 
  //
  var timeSpanKey = ""
  if(type == 0){
    timeSpanKey = "block_time"
  }else if(type == 1){
    timeSpanKey = "timeStamp"
  }

  if(indexConditon > 0){
      timeSpan = txs[indexConditon - 1][timeSpanKey];
      
  }else{

    if(txs.length > 0){
      timeSpan = txs[txs.length - 1][timeSpanKey];
    }else{
      return 0;
    }

  }
  return timeSpan;

}

//get value of certain address
function getValue(tx,address){

  var retValue = 0
  //check output
  var outputs = tx["outputs"]
  var len = outputs.length
  var ifFinish = false
  for(var i = 0 ;i < len ; i ++){
    if(outputs[i]["addresses"].length > 0 && outputs[i]["addresses"][0] == address){
      ifFinish = true;
      retValue = outputs[i]["value"];
      break;
     
    }
  }
  
  //check input
  var inputs = tx["inputs"]
  len = inputs.length
  for(var i = 0 ;i < len ; i ++){
    if(inputs[i]["prev_addresses"].length > 0 && inputs[i]["prev_addresses"][0] == address){
      ifFinish  = true;
      retValue = -1 * inputs[i]["prev_value"]
      break;
    }
  }

  if(ifFinish){
    return retValue;
  }
  console.log("value not find ");

  return retValue

}

const getBtcBalanceAsync = async (btcAddress) =>{

  const url = `https://chain.api.btc.com/v3/address/${btcAddress}`

  var btcValue = 0;
  await Requester.request(url, customError)
    .then(response => {
      btcValue = response["data"]["data"]["balance"];
    })
    .catch(error => {
      btcValue = -1
    })

    return btcValue;
  
}
///ethRawaddr
const createEthRawaddr = async (address, callback) => {


  requestJson = {};
  page = 1 ;
  doCall = true;
  pageSize = 50;
  timeSpanLength = 10;
  
  while (doCall) {
    
    //console.log(page);
    requestJson = await RequstForEthRawaddr(address,page);
    page ++;
    
    if(page * pageSize > requestJson["txCnt"]){
      doCall = false
    }

    //do not find
    if(requestJson["timespan"] == 0){
      doCall = false
    }

    //find the data
    if(requestJson["timespan"].toString().length == timeSpanLength ){
      doCall = false
    }
  }

  const retReponse = {
    data:requestJson["timespan"]
  }

  if(requestJson["timespan"] == 0){
    callback(500, retReponse)
  }else{
    callback(200, retReponse)
  }

}


///
const RequstForEthRawaddr = async (ethAddress,page) =>{

  retTimespan = 0
  n_tx = 0
  const url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + ethAddress + "&page=" + page +"&offset=50&sort=desc&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C"

  final_balance = await getEthBalanceAsync(ethAddress);
  
  await Requester.request(url, customError)
  .then(response => {
    
    txs = response["data"]["result"];
    retTimespan = getHistoryBalanceTime(txs,bignum(final_balance),ethAddress,1);
  
  })
  .catch(error => {
    return {timespan:0,txCnt:0};
  })

  return {timespan:retTimespan,txCnt:n_tx};

}

// //getTimeSpan
// const getHistoryEthTime = (txs,orgBalance,ethAddress) =>{

//   balance = bignum(orgBalance);
//   console.log(balance);
//   curBalance = balance;
//   isFirstCondtion = false;
//   isSecendCondtion = false;
//   timeSpan = 0;
//   indexConditon = 0;

  
//   for(var index = 0 ;index < txs.length ;index ++ ){

//       if(curBalance < balance){
//           isSecendCondtion = true;
//       }

//       if(isFirstCondtion && isSecendCondtion ){
//           indexConditon = index;
//           break;
//       }

//       if(curBalance >= balance){
//           isFirstCondtion = true
//       }else{
//           isFirstCondtion = false
//       }

//       //chech is +/-
//       if(txs[index]['from'] == ethAddress){
//         curBalance = curBalance.add(txs[index]["value"])
//       }else{
//         curBalance = curBalance.sub(txs[index]["value"])
//       }
//   }
 
//   if(indexConditon > 0){
//       timeSpan = txs[indexConditon - 1]["timeStamp"];
//   }else{
//       return 0;
//   }

//   return timeSpan;

// }

const getEthBalanceAsync = async (ethAddress) =>{

  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C`

  var ethValue = "0";
  await Requester.request(url, customError)
    .then(response => {
      ethValue = response["data"]["result"];
    })
    .catch(error => {
      ethValue = "0"
    })

    return ethValue;
  
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





// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
//
module.exports.createBtcRequest = createBtcRequest
module.exports.createEthRequest = createEthRequest

//
module.exports.createBtcRawaddr = createBtcRawaddr
module.exports.createEthRawaddr = createEthRawaddr