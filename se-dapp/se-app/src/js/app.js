App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  init: function() {
    console.log("init");
    
    $.getJSON('../sellers.json', function(seller) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');
      var data = JSON.parse(localStorage.getItem("seller"));
      //seller="";
      //localStorage.setItem("seller", JSON.stringify(seller));
      if(data.length<=5){
        for (i = 0; i < seller.length; i ++) {
          proposalTemplate.find('.panel-title').text(seller[i].name);
          proposalTemplate.find('img').attr('src', seller[i].picture);
          proposalTemplate.find('.panel-title2').text(seller[i].price);
          proposalTemplate.find('.panel-title2').attr('name',seller[i].acc_no);
          proposalTemplate.find('.btn-buyitem').attr('data-id', seller[i].acc_no);
          proposalsRow.append(proposalTemplate.html());
        } 
        localStorage.setItem("seller", JSON.stringify(seller));
    }else{
        seller = JSON.parse(localStorage.getItem("seller"));
        for (i = 0; i < seller.length; i ++) {
          proposalTemplate.find('.panel-title').text(seller[i].name);
          proposalTemplate.find('img').attr('src', seller[i].picture);
          proposalTemplate.find('.panel-title2').text(seller[i].price);
          proposalTemplate.find('.panel-title2').attr('name',seller[i].acc_no);
          proposalTemplate.find('.btn-buyitem').attr('data-id', seller[i].acc_no);

          proposalsRow.append(proposalTemplate.html());
      } 
    }
    });
    return App.initWeb3();
  },

  initWeb3: function() {
    console.log("initWeb3");
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    return App.initContract();
  },

  initContract: function() {
      $.getJSON('StyleElite.json', function(data) {
        console.log("initContract");
    App.contracts.styleElite = TruffleContract(data);

    App.contracts.styleElite.setProvider(App.web3Provider);
    
    return App.bindEvents();
  });
  },

  bindEvents: function() {
    console.log("bindEvents");
    $(document).on('click',"#submit_user", App.submitUser);
    $(document).on('click',".btn-buyitem", App.buyItem);
    $(document).on('click',"#getreg_item", App.getregisteredItem);
    $(document).on('click',"#remove_item", App.removeItem);
    $(document).on('click',"#blk_item", App.blockAccount);
    $(document).on('click',"#unblk_item", App.unblockAccount);
    $(document).on('click',"#addadmin", App.adminAdd);
  },

  submitUser : function() {
    console.log("submitUser");
    var name_ = document.getElementById("full_name");
    var price_ = document.getElementById("price");
    var accNo_ = document.getElementById("account_number");
    var pic = "images/4.jpg";

    console.log(name_.value, price_.value, accNo_.value);

    var item = {
      name: name_.value,
      price:price_.value,
      acc_no:accNo_.value,
      picture:pic
    };

    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;

      await buyInstance.registerSeller(1, price_.value, accNo_.value,{from: web3.eth.accounts[0], gas:3000000});

      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');

      proposalTemplate.find('.panel-title').text(name_.value);
      proposalTemplate.find('img').attr('src', pic);
      proposalTemplate.find('.panel-title2').text(price_.value);

      proposalTemplate.find('.btn-buyitem').attr('data-id', accNo_.value);

      proposalsRow.append(proposalTemplate.html());

      const data = localStorage.getItem("seller");
      var obj = JSON.parse(data);
      obj.push(item);
      localStorage.setItem("seller", JSON.stringify(obj))
      return document.location.reload(true);
    }).then(function(res){
      console.log(res);
    }).catch(function(err){
      console.log(err.message);
    })
    

  },

  buyItem : function(){
    console.log("buyItem");
    event.preventDefault();
    var accountNo = $(event.target).data('id');
    //console.log(price_.value, accNo_.value);
    console.log($(event.target).data());
    var price = parseInt(document.getElementsByName(accountNo)[0].innerHTML);
    console.log("price: ", price);
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      //myContractInstance.depositFunds();  
                                                                                             //add variable   
      await buyInstance.buy(accountNo, price*1000000000000000000,{from: web3.eth.accounts[0], gas: 3000000, value: price*1000000000000000000});
      
    }).then(function(res){
      console.log(res);
    }).catch(function(err){
      console.log(err.message);
      alert("The account you are trying to buy is suspended.")
    })
  },

  getregisteredItem: async function(){
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      var length1 = await buyInstance.getLength.call({from: web3.eth.accounts[0], gas:3000000});
      console.log("length : ", parseInt(length1.toString()));

      const arr = []
      for(let i=0; i<parseInt(length1.toString()); i++ ){
        const a= await buyInstance.getItemsByIndex.call(i,{from: web3.eth.accounts[0], gas:3000000});
        console.log("this is returned value: ", a, a.toString())
        arr[i]=[a[0].toString(), a[1].toString(), a[2].toString()];
      }
      console.log(arr);
      return document.location.reload(true);
    }).then(function(res){
      console.log(res);
    }).catch(function(err){
      console.log(err.message);
    })
  },

  removeItem: function(){
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      var name = document.getElementById('rmfull_name').value;
      var accountNo = document.getElementById('rmaccount_number').value;
      console.log(accountNo);
      await buyInstance.removeAccount(accountNo,{from: web3.eth.accounts[0], gas: 3000000});

      var data = JSON.parse(localStorage.getItem("seller"));
      
      var arr = [];

      for(let i=0; i<data.length; i++){
        if(!(data[i].name==name && data[i].acc_no==accountNo)){
          arr.push(data[i]);
        }
      }
      localStorage.setItem("seller", JSON.stringify(arr));
      document.location.reload(true);
      return accountNo;
    }).then(function(res){
      console.log(res);
      alert("item removed!")
    }).catch(function(err){
      console.log(err.message);
      alert("Only Admin can remove items!")
    })
  },
  blockAccount: function(){
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      var accountNo = document.getElementById('blkaccount_number').value;
      console.log(accountNo);
      await buyInstance.blockAccount(accountNo,{from: web3.eth.accounts[0], gas: 3000000});
      return accountNo;
    }).then(function(res){
      console.log(res);
      alert("Account: "+res+ " is blocked!")
    }).catch(function(err){
      console.log(err.message);
    })
  },
  unblockAccount: function(){
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      var accountNo = document.getElementById('unblkaccount_number').value;
      console.log(accountNo);
      await buyInstance.unblockAccount(accountNo,{from: web3.eth.accounts[0], gas: 3000000});
      return accountNo;
    }).then(function(res){
      console.log(res);
      alert("Account: "+res+ " is unblocked!")
    }).catch(function(err){
      console.log(err.message);
    })
  },
  adminAdd: function(){
    var buyInstance;
    App.contracts.styleElite.deployed().then(async function(instance) {
      buyInstance = instance;
      var accountNo = document.getElementById('adminaccno').value;
      console.log(accountNo);
      await buyInstance.addAdmin(accountNo,{from: web3.eth.accounts[0], gas: 3000000});
      return accountNo;
    }).then(function(res){
      console.log(res);
      alert("Account: "+res+ " is an admin now!")
    }).catch(function(err){
      console.log(err.message);
    })
  }
};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
