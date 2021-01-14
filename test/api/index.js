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

  console.log(input);

  getBtcBalance(input.btcAddress ,(btcBalance) => {
    console.log('btcBalance: ', btcBalance)

    getEthBalance(input.ethAddress,(ethBalance) =>{
      console.log('ethBalance: ', ethBalance)

      const retReponse = {
          status:200,
          data:[btcBalance,ethBalance]
      }
      callback(200, retReponse)

    });

  })

}

//seperate the api btc
const createBtcRequest = (address, callback) => {
  
  getBtcBalance(address ,(btcBalance) => {
    console.log('btcBalance: ', btcBalance)
    const retReponse = {
        data:btcBalance
    }
    callback(200, retReponse)
  });

}

const createEthRequest = (address, callback) => {
  
  getEthBalance(address ,(ethBalance) => {
    console.log('ethBalance: ', ethBalance)
    const retReponse = {
        data:ethBalance
    }
    callback(200, retReponse)
  });

}



const getBtcBalance = (btcAddress,callback)  => {

  const url = `https://blockchain.info/q/addressbalance/${btcAddress}`

  console.log(url);

  Requester.request(url, customError)
    .then(response => {
      callback(response.data);
    })
    .catch(error => {
      console.log("get btc balance error :");
      console.log(error);
      callback(-1);
    })
}

const getEthBalance = (ethAddress,callback) =>{

  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C`

  Requester.request(url, customError)
    .then(response => {
      //const result = Requester.validateResultNumber(response.data,["result"])
      
      //const result = Requester.validateResultNumber(response.data,["result"])
      result = response.data["result"];
      
      callback(result);
    })
    .catch(error => {
      console.log("get eth balance error :");
      console.log(error);
      callback(-1);
    })

}

//
const createBtcRawaddr = async (address, callback) => {
  

  requestJson = {};
  offset = 0 ;
  doCall = true;

  while (doCall) {

    requestJson = await RequstForBtcRawaddr(address,offset);
    offset ++;
    
    //console.log(requestJson);
    //call all the data
    if(offset * 50 > requestJson["txCnt"]){
      doCall = false
    }

    //cath error
    if(requestJson["timespan"] == 0){
      doCall = false
    }

    //find the data
    if(requestJson["timespan"].toString().length > 2 ){
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
  const url = "https://blockchain.info/rawaddr/" + btcAddress + "?limit=50&offset=" + offset
  //console.log(url);

  await Requester.request(url, customError)
  .then(response => {
    
    txs = response["data"]["txs"];
    final_balance =  response["data"]["final_balance"];
    n_tx = response["data"]["n_tx"];
    retTimespan = getHistoryBalanceTime(txs,final_balance);

  })
  .catch(error => {
    console.log("get eth balance error :");
    console.log(error);
    return {timespan:0,txCnt:0};
   
  })

  return {timespan:retTimespan,txCnt:n_tx};

}

//getTimeSpan
const getHistoryBalanceTime = (txs,balance) =>{

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

      curBalance = curBalance - txs[index]["result"]
     
  }
 
  if(indexConditon > 0){
      timeSpan = txs[indexConditon - 1]["time"];
      //console.log(txs[0]["result"])
  }else{
      return 0;
  }

  // var date = new Date(timeSpan * 1000);
  // retDate = sd.format(date,"YYYY-MM-DD-HH:mm");
  // console.log(retDate);
  // return retDate;
  return timeSpan;

}

///ethRawaddr
const createEthRawaddr = async (address, callback) => {
  
  requestJson = {};
  page = 1 ;
  doCall = true;

  while (doCall) {
    
    //console.log(page);
    requestJson = await RequstForEthRawaddr(address,page);
    page ++;
    

     //cath error
    if(requestJson["timespan"] == -1){
      page --;
      doCall = true
    }

    //do not find
    if(requestJson["timespan"] == 0){
      doCall = true
    }

    //find the data
    if(requestJson["timespan"].toString().length > 2 ){
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
  const url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + ethAddress + "&page=" + page +"&offset=100&sort=desc&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C"
  final_balance = await getEthBalanceAsync(ethAddress);
  
  await Requester.request(url, customError)
  .then(response => {
    
    txs = response["data"]["result"];
    retTimespan = getHistoryEthTime(txs,final_balance,ethAddress);

  })
  .catch(error => {
    console.log("get eth RequstForEthRawaddr error :");
    console.log(error);
    return {timespan:-1,txCnt:0};
   
  })

  return {timespan:retTimespan,txCnt:n_tx};

}

//getTimeSpan
const getHistoryEthTime = (txs,orgBalance,ethAddress) =>{

  balance = bignum(orgBalance);
  curBalance = balance;
  isFirstCondtion = false;
  isSecendCondtion = false;
  timeSpan = 0;
  indexConditon = 0;

  console.log("xxl length " + txs.length);
  for(var index = 0 ;index < txs.length ;index ++ ){

      console.log("xxl ... start " + index);
      console.log(txs[index]);
      console.log("xxl ... end " + index);

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

      //chech is +/-
      if(txs[index]['from'] == ethAddress){
        curBalance = curBalance.add(txs[index]["value"])
      }else{
        curBalance = curBalance.sub(txs[index]["value"])
      }
      console.log("xxl cur " + curBalance);

  
  }
 
  console.log("xxl indexConditon " + indexConditon);
  if(indexConditon > 0){
      timeSpan = txs[indexConditon - 1]["timeStamp"];
      //console.log(txs[0]["result"])
  }else{
      return 0;
  }

  return timeSpan;

}

const getEthBalanceAsync = async (ethAddress) =>{

  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=NF6N7FHJSHMIXZ34XDB4VIBQ8Z6242SW3C`

  var ethValue = "0";
  await Requester.request(url, customError)
    .then(response => {
      console.log("xxl getEthBalanceAsync  ...");
      console.log(response["data"]["result"]);
      //return response["data"]["result"];
      ethValue = response["data"]["result"];
    })
    .catch(error => {
      console.log("get eth balance error ! :");
      console.log(error);
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