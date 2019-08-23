var invoke = require('../blockchain/invoke-transaction.js');
var query = require('../blockchain/query.js');
var rna = require('../config/rna');

var peer = rna.peer;
var channelName = rna.channelName;
var chaincodeName = rna.chaincodeName;
var username = rna.username;
var orgname = rna.orgname;

var myinvoke = async function(){
    var rows = arguments[0];
    if(arguments.length == 2){
        try {
            var fcn = 'tx_state';
            var status = arguments[1];
            //	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
            //	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
            var args = [rows[1].Number.toString(), status , 'RNA_'+rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
            await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
        } catch (err) {
            console.log('invoke error :' + err);
        }
    } else if(arguments.length == 3){
        try{
            var fcn = 'report';
            var details = arguments[2];
             //	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
             //	txID  details  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
            var args = [rows[1].Number.toString(), details , 'RNA_'+rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
            await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
        } catch (err){
            console.log('invoke error :' + err);
        }
    }
}

module.exports = myinvoke;