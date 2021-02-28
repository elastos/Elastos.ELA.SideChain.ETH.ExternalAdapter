const sd = require("silly-datetime");
const { Requester, Validator } = require('@chainlink/external-adapter')

testData = {
    final_balance:2413000,
    txs:[
        {result:2413000,time:1597425860},
        {result:-4678300000,time:1339172906},
        {result:4678300000,time:1339152347}
    ]
};
const customError = (data) => {
    if (data.Response === 'Error') return true
    return false
  }

//////////////////---start .... ---/////////////////////////////
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
        return "";
    }

    var date = new Date(timeSpan * 1000);
    retDate = sd.format(date,"YYYY-MM-DD-HH:mm");
    console.log(retDate);

    return retDate;

}
//////
const getBtcRawaddr = async (btcAddress) =>  {


    offSet = 0;
    const url = `http://47.52.148.190:8088/balance/btc/?address=1EzwoHtiXB4iFwedPr49iywjZn2nnekhoj` ;
  

    ret = "1";
    await Requester.request(url, customError)
      .then(response => {
        ret = "2";
      })
      .catch(error => {
        console.log("get eth balance error :");
        console.log(error);
        callback(-1);
      })

   console.log(ret);
   console.log("abc ... ");   
  

}


  
//////////////////---end .... ---/////////////////////////////
getBtcRawaddr("abc");


//getHistoryBalanceTime(testData["txs"],testData["final_balance"]);








