// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract StyleElite {

    struct SellerItem{
        uint id;
        uint price;
        address accountNumber;
    }

    SellerItem[] sellerItem;
    mapping(address => bool) public seller;
    mapping(address => bool) private admin;
    
    constructor() public payable{
        admin[msg.sender] = true;
    }
    modifier OnlyAdmin(){
        require(admin[msg.sender]);
        _;
    }

    modifier sufficientMoneySent(uint itemValue){
        require(msg.value>=itemValue);
        _;
    }

    modifier SellerActive(address sellerAdd){
        require(seller[sellerAdd]);
        _;
    }

    function addAdmin(address adminAddr) public OnlyAdmin{
        admin[adminAddr] = true;
    }
    function buy(address payable itemSeller, uint itemPrice) public payable sufficientMoneySent(itemPrice) SellerActive(address(itemSeller)){
        itemSeller.transfer(msg.value);
    }
    function removeAccount(address sellerAddr) public OnlyAdmin{
        delete seller[sellerAddr];
    }
    function blockAccount(address sellerAddr) public OnlyAdmin{
        seller[sellerAddr] = false;
    }
    function unblockAccount(address sellerAddr) public OnlyAdmin{
        seller[sellerAddr] = true;
    }
    function getBalanceContract() public view returns(uint){
        return address(this).balance;
    }

    function registerSeller(uint id_, uint price_, address sellerAddr) public {//OnlyAdmin
        seller[sellerAddr] = true;
        SellerItem memory item;
        item.id=id_;
        item.price=price_;
        item.accountNumber=sellerAddr;
        sellerItem.push(item);
    }
    
    function getLength() public view returns(uint){
        return sellerItem.length;
    }
    function getItemsByIndex(uint index)public view returns(uint, uint, address){
        return (sellerItem[index].id,sellerItem[index].price,sellerItem[index].accountNumber);
    }

}