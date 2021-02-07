pragma solidity 0.4.24;

//ethereum 
//import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.4/ChainlinkClient.sol";
//ela
import "https://github.com/elastos/Elastos.ELA.SideChain.ETH.Chainlink/evm-contracts/src/v0.4/ChainlinkClient.sol";
import "https://github.com/elastos/Elastos.ELA.SideChain.ETH.Chainlink/evm-contracts/src/v0.4/vendor/Ownable.sol";

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0/contracts/math/SafeMath.sol";

contract DataConsumer is ChainlinkClient, Ownable {

  uint256 constant private ORACLE_PAYMENT = 1 * 10**16;
  //using SafeMath for uint256;

  constructor() public Ownable() {
    //setPublicChainlinkToken();
  }

  function() public payable{
      require(msg.value > 0);
  }
  //----BTC
  /// RequestBtcBalance
  uint256 public btcBalance;
  event RequestBtcBalanceFulfilled(
    bytes32 indexed requestId,
    uint256 indexed btcBalance
  );

  function RequestBtcBalance(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillBtcBalance.selector);
    req.add("get", strConcat("http://47.242.107.228:8090/balance/btc/?address=" ,_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillBtcBalance(bytes32 _requestId, uint256 _btcBalance)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcBalanceFulfilled(_requestId, _btcBalance);
    btcBalance = _btcBalance;
  }

  /// RequestBtcTimespan
  uint256 public btcTimpspan;
  event RequestBtcTimespanFulfilled(
    bytes32 indexed requestId,
    uint256 indexed btcTimespan
  );

  function RequestBtcTimespan(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillBtcTimespan.selector);
    req.add("get", strConcat("http://47.242.107.228:8090/rawaddr/btc?address=" ,_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillBtcTimespan(bytes32 _requestId, uint256 _btcTimeSpan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcTimespanFulfilled(_requestId, _btcTimeSpan);
    btcTimpspan = _btcTimeSpan;
  }

  //---
  address oracle;
  string jobId;
  string btcAddress;
  event RequestBtcScoreFulfilled(
    uint256 indexed btcBalance,
    uint256 indexed btcTimespan
  );
  function RequestBtcScore(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    oracle = _oracle;
    jobId = _jobId;
    btcAddress = _address;

    Chainlink.Request memory reqBtc = buildChainlinkRequest(stringToBytes32(jobId), this, this.fulfillBtcSorceBalance.selector);
    reqBtc.add("get", strConcat("http://47.242.107.228:8090/balance/btc/?address=" ,btcAddress));
    reqBtc.add("path", "data");
    sendChainlinkRequestTo(oracle, reqBtc, ORACLE_PAYMENT);

  }

  function fulfillBtcSorceBalance(bytes32 _requestId, uint256 _btcBalance)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcBalanceFulfilled(_requestId, _btcBalance);
    btcBalance = _btcBalance;

    Chainlink.Request memory reqTimespan = buildChainlinkRequest(stringToBytes32(jobId), this, this.fulfillBtcSoreTimespan.selector);
    reqTimespan.add("get", strConcat("http://47.242.107.228:8090/rawaddr/btc?address=" ,btcAddress));
    reqTimespan.add("path", "data");
    sendChainlinkRequestTo(oracle, reqTimespan, ORACLE_PAYMENT);

  }

  uint256 public btcScore = 0;
  function fulfillBtcSoreTimespan(bytes32 _requestId, uint256 _btcTimeSpan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcTimespanFulfilled(_requestId, _btcTimeSpan);
    btcTimpspan = _btcTimeSpan;

    emit RequestBtcScoreFulfilled(btcBalance,btcTimpspan);
    btcScore = calcBtcScore();
    
  }
  
  event RequestBtcScoreResult(
    uint256 indexed btcScore
  );
  
  function calcBtcScore() internal returns (uint256 score){
      

    uint256 _btcBalanceScore = btcBalance.div(10000000);
   
    uint256 _timespanScore = (now.sub(btcTimpspan)).div(3600).div(24).div(10);
    uint256 _btcScore = _btcBalanceScore + _timespanScore;
    emit RequestBtcScoreResult(_btcScore);
    
    return _btcScore;
  }

  //----ETH
  string ethAddress;
  event RequestEthScoreFulfilled(
    uint256 indexed ethBalance,
    uint256 indexed ethTimespan
  );
  function RequestEthScore(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    oracle = _oracle;
    jobId = _jobId;
    ethAddress = _address;

    Chainlink.Request memory reqEth = buildChainlinkRequest(stringToBytes32(jobId), this, this.fulfillEthSorceBalance.selector);
    reqEth.add("get", strConcat("http://47.242.107.228:8090/balance/eth?address=" ,ethAddress));
    reqEth.add("path", "data");
    sendChainlinkRequestTo(oracle, reqEth, ORACLE_PAYMENT);

  }

  function fulfillEthSorceBalance(bytes32 _requestId, uint256 _ethBalance)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthBalanceFulfilled(_requestId, _ethBalance);
    ethBalance = _ethBalance;

    Chainlink.Request memory reqTimespan = buildChainlinkRequest(stringToBytes32(jobId), this, this.fulfillEthSoreTimespan.selector);
    reqTimespan.add("get", strConcat("http://47.242.107.228:8090/rawaddr/eth?address=" ,ethAddress));
    reqTimespan.add("path", "data");
    sendChainlinkRequestTo(oracle, reqTimespan, ORACLE_PAYMENT);

  }

  uint256 public ethScore = 0;
  function fulfillEthSoreTimespan(bytes32 _requestId, uint256 _ethTimeSpan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthTimespanFulfilled(_requestId, _ethTimeSpan);
    ethTimpspan = _ethTimeSpan;

    emit RequestEthScoreFulfilled(ethBalance,ethTimpspan);
    ethScore = calcEthScore();
    
  }
  
  event RequestEthScoreResult(
    uint256 indexed ethScore
  );
  
  function calcEthScore() internal returns (uint256 score){
      

    uint256 _ethBalanceScore = ethBalance.div(200000000000000000);
   
    uint256 _timespanScore = (now.sub(ethTimpspan)).div(3600).div(24).div(200);
    uint256 _ethScore = _ethBalanceScore + _timespanScore;
    emit RequestEthScoreResult(_ethScore);
    
    return _ethScore;
  }
  ////  
  

  /// RequestETHBalance
  uint256 public ethBalance;
  event RequestEthBalanceFulfilled(
    bytes32 indexed requestId,
    uint256 indexed ethBalance
  );

  function RequestEthBalance(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthBalance.selector);
    req.add("get", strConcat("http://47.242.107.228:8090/balance/eth/?address=" ,_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillEthBalance(bytes32 _requestId, uint256 _ethBalance)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthBalanceFulfilled(_requestId, _ethBalance);
    ethBalance = _ethBalance;
  }

  /// RequestEthTimespan
  uint256 public ethTimpspan;
  event RequestEthTimespanFulfilled(
    bytes32 indexed requestId,
    uint256 indexed ethTimespan
  );

  function RequestEthTimespan(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthTimespan.selector);
    req.add("get", strConcat("http://47.242.107.228:8090/rawaddr/eth?address=" ,_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillEthTimespan(bytes32 _requestId, uint256 _ethTimpspan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthTimespanFulfilled(_requestId, _ethTimpspan);
    ethTimpspan = _ethTimpspan;
  }

  ///
  function strConcat(string a, string b) internal pure returns (string) {
      return string(abi.encodePacked(a, b));
  }
  
 

  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }

}