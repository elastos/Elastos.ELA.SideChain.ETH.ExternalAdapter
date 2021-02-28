const sd = require("silly-datetime");
// //const btcBlanance = require('./contracts/BtcBalanceConsumer.json');
// const Web3 = require('web3');

// //const ws = "ws://13.115.138.227:8546";
// //const ws = "wss://kovan.infura.io/ws/v3/7e31d49d7c8a48f4a4539aff9da768e7";
// const ws = "ws://13.115.138.227:20635";
// var web3Obj = new Web3(ws);
// const ContractAddress = "0x29547bB949b50fE49AD7db2C61661FD6aA7E7425";


// //console.log(web3Obj);
// console.log(ContractAddress);

// const btcBlananceContract = new web3Obj.eth.Contract(btcBlanance.abi, ContractAddress, {
//   gasPrice: 1000000000, // 1gwei
//   gasLimit: 4000000,
// });

// btcBlananceContract.events.goEvt({
// }, function(err, data) {
  
//     console.log(err, data);

// });

testData = {
    final_balance:2413000,
    txs:[
        {result:2413000,time:1597425860},
        {result:-4678300000,time:1339172906},
        {result:4678300000,time:1339152347}
    ]
};

const getHistoryBalanceTime = (txs,balance) =>{

    curBalance = balance;
    isFirstCondtion = false;
    isSecendCondtion = false;
    timeSpan = 0;
    indexConditon = 0;

    for(var index = 0 ;index < txs.length ;index ++ ){

        ///console.log("curBalance : " + curBalance);
        //console.log("index : " + index);

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
        return "";
    }

    var date = new Date(timeSpan * 1000);
    retDate = sd.format(date,"YYYY-MM-DD-HH:mm");
    console.log(retDate);

    return retDate;

}




getHistoryBalanceTime(testData["txs"],testData["final_balance"]);








