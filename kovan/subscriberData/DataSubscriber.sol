pragma solidity 0.4.24;

//ethereum 
import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.4/ChainlinkClient.sol";
//ela
//import "https://github.com/elastos/Elastos.ELA.SideChain.ETH.Chainlink/evm-contracts/src/v0.4/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.4/vendor/Ownable.sol";

contract DataSubscriber is ChainlinkClient, Ownable {

  uint256 constant private ORACLE_PAYMENT = 1 * LINK;
  
  constructor() public Ownable() {
    setPublicChainlinkToken();
  }

  //btc
  ///btcBalance
  uint256 public btcBalance;
  event RequestBtcBalanceFulfilled(
    bytes32 indexed requestId,
    uint256 indexed btcBalance
  );

  function RequestBtcBalance(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillBtcBalance.selector);
    req.add("get", "http://47.242.107.228:8089/chain/watch/btcBalance");
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

  ///btcTimespan
  uint256 public btcTimespan;
  event RequestBtcTimespanFulfilled(
    bytes32 indexed requestId,
    uint256 indexed btcTimespan
  );

  function RequestBtcTimespan(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillBtcTimespan.selector);
    req.add("get", "http://47.242.107.228:8089/chain/watch/btcTimespan");
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillBtcTimespan(bytes32 _requestId, uint256 _btcTimespan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcBalanceFulfilled(_requestId, _btcTimespan);
    btcTimespan = _btcTimespan;
  }

  ///btcScore
  uint256 public btcScore;
  event RequestBtcScoreFulfilled(
    bytes32 indexed requestId,
    uint256 indexed btcScore
  );

  function RequestBtcScore(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillBtcScore.selector);
    req.add("get", strConcat("http://47.242.107.228:8089/chain/watch/btcScore?address=",_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillBtcScore(bytes32 _requestId, uint256 _btcScore)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestBtcScoreFulfilled(_requestId, _btcScore);
    btcScore = _btcScore;
  }

  //eth
  ///ethBalance
  uint256 public ethBalance;
  event RequestEthBalanceFulfilled(
    bytes32 indexed requestId,
    uint256 indexed ethBalance
  );

  function RequestEthBalance(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthBalance.selector);
    req.add("get", "http://47.242.107.228:8089/chain/watch/ethBalance");
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

  ///ethTimespan
  uint256 public ethTimespan;
  event RequestEthTimespanFulfilled(
    bytes32 indexed requestId,
    uint256 indexed ethTimespan
  );

  function RequestEthTimespan(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthTimespan.selector);
    req.add("get", "http://47.242.107.228:8089/chain/watch/ethTimespan");
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillEthTimespan(bytes32 _requestId, uint256 _ethTimespan)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthTimespanFulfilled(_requestId, _ethTimespan);
    ethTimespan = _ethTimespan;
  }

  ///ethScore
  uint256 public ethScore;
  event RequestEthScoreFulfilled(
    bytes32 indexed requestId,
    uint256 indexed ethScore
  );

  function RequestEthScore(address _oracle, string _jobId,string _address)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthScore.selector);
    req.add("get", strConcat("http://47.242.107.228:8089/chain/watch/ethScore?address=",_address));
    req.add("path", "data");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function fulfillEthScore(bytes32 _requestId, uint256 _ethScore)
    public
    recordChainlinkFulfillment(_requestId)
  {
   
    emit RequestEthScoreFulfilled(_requestId, _ethScore);
    ethScore = _ethScore;
  }

  ///
  function strConcat(string a, string b) internal pure returns (string) {
      return string(abi.encodePacked(a, b));
  }
  
  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
  }

  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
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