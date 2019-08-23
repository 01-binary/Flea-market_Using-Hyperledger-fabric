/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main


import (
	"bytes"
	"fmt"
	"strconv"
	"encoding/json"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("example_cc0")

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type doc struct {
	ObjectType	string	`json:"docType"`
	Timestamp	string 	`json:"timestamp"`
	TxID		string	`json:"txID"`
	Details		string	`json:"details"`
	SellerID 	string 	`json:"sellerID"`
	SellerName 	string 	`json:"sellerName"`
	SellerRRN	string 	`json:"sellerRRN"`
	BuyerID		string 	`json:"buyerID"`
	BuyerName	string 	`json:"buyerName"`
	BuyerRRN	string	`json:"buyerRRN"`
	Product		string  `json:"product"`
	Price 		string  `json:"price"`
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response  {
	logger.Info("########### example_cc0 Init ###########")

	_, args := stub.GetFunctionAndParameters()
	var A, B string    // Entities
	var Aval, Bval int // Asset holdings
	var err error

	// Initialize the chaincode
	A = args[0]
	Aval, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	B = args[2]
	Bval, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	logger.Info("Aval = %d, Bval = %d\n", Aval, Bval)

	// Write the state to the ledger
	err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)


}

// Transaction makes payment of X units from A to B
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("########### example_cc0 Invoke ###########")

	function, args := stub.GetFunctionAndParameters()
	
	if function == "delete" {
		// Deletes an entity from its state
		return t.delete(stub, args)
	}

	if function == "query" {
		// queries an entity state
		return t.query(stub, args)
	}
	if function == "move" {
		// Deletes an entity from its state
		return t.move(stub, args)
	}
	if function == "tx_state" {
		// Update transaction state
		return t.tx_state(stub, args)
	}
	if function == "report" {
		// Report the transaction
		return t.report(stub, args)
	}
	if function == "history" {
		// Report the transaction
		return t.history(stub, args)
	}
	if function == "queryBySeller" {
		// queries an entity state
		return t.queryBySeller(stub, args)
	}
	if function == "queryByBuyer" {
		// queries an entity state
		return t.queryByBuyer(stub, args)
	}

	logger.Errorf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0])
	return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0]))
}

func (t *SimpleChaincode) move(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// must be an invoke
	var A, B string    // Entities
	var Aval, Bval int // Asset holdings
	var X int          // Transaction value
	var err error

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 4, function followed by 2 names and 1 value")
	}

	A = args[0]
	B = args[1]

	// Get the state from the ledger
	// TODO: will be nice to have a GetAllState call to ledger
	Avalbytes, err := stub.GetState(A)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if Avalbytes == nil {
		return shim.Error("Entity not found")
	}
	Aval, _ = strconv.Atoi(string(Avalbytes))

	Bvalbytes, err := stub.GetState(B)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if Bvalbytes == nil {
		return shim.Error("Entity not found")
	}
	Bval, _ = strconv.Atoi(string(Bvalbytes))

	// Perform the execution
	X, err = strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("Invalid transaction amount, expecting a integer value")
	}
	Aval = Aval - X
	Bval = Bval + X
	logger.Infof("Aval = %d, Bval = %d\n", Aval, Bval)

	// Write the state back to the ledger
	err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Error(err.Error())
	}

        return shim.Success(nil);
}

// Deletes an entity from state
func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	A := args[0]

	// Delete the key from the state in ledger
	err := stub.DelState(A)
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	return shim.Success(nil)
}

// Query callback representing the query of a chaincode
func (t *SimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var keyID string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting ID of the transaction to query")
	}

	keyID = args[0]

	// Get the state from the ledger
	valAsbytes, err := stub.GetState(keyID)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + keyID + "\"}"
		return shim.Error(jsonResp)
	}

	if valAsbytes == nil {
		jsonResp := "{\"Error\":\"Transaction does not exist " + keyID + "\"}"
		return shim.Error(jsonResp)
	}

	// jsonResp := "{\"Transaction ID\":\"" + keyID + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
	// logger.Infof("Query Response:%s\n", jsonResp)
	return shim.Success(valAsbytes)
}

// Update transaction state
func (t *SimpleChaincode) tx_state(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	var err error

	//	  0	      1        2		  3 		 4         5         6	        7		 8	     9	   10
	//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
	if len(args) != 11 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	txID := args[0]
	txState := args[1]
	sellerID := args[2]
	sellerName := args[3]
	sellerRNN := args[4]
	// if err != nil {
	// 	return shim.Error("5th argument must be a numeric string")
	// }
	buyerID := args[5]
	buyerName := args[6]
	buyerRNN := args[7]
	// if err != nil {
	// 	return shim.Error("8th argument must be a numeric string")
	// }
	product := args[8]
	price := args[9]
	web := args[10]

	objectType := "transaction"
	tx := &doc{objectType, timestamp, txID, txState, sellerID, sellerName, sellerRNN, buyerID, buyerName, buyerRNN, product, price}
	txJSONasBytes, err := json.Marshal(tx)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(web + "_" + txID + "_" + txState, txJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	logger.Info("Transaction ID = " + txID + ", Transaction State = " + txState + "\n")

	return shim.Success(nil)
}

// Report  the transaction
func (t *SimpleChaincode) report(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var err error

	//	  0	     1   	   2		 3 	   	     4        5          6	        7        8	     9     10
	//	txID  details  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
	if len(args) != 11 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	txID := args[0]
	details := args[1]
	sellerID := args[2]
	sellerName := args[3]
	sellerRNN := args[4]
	// if err != nil {
	// 	return shim.Error("6th argument must be a numeric string")
	// }
	buyerID := args[5]
	buyerName := args[6]
	buyerRNN := args[7]
	// if err != nil {
	// 	return shim.Error("9th argument must be a numeric string")
	// }
	product := args[8]
	price := args[9]
	web := args[10]

	objectType := "report"
	rp := &doc{objectType, timestamp, txID, details, sellerID, sellerName, sellerRNN, buyerID, buyerName, buyerRNN, product, price}
	rpJSONasBytes, err := json.Marshal(rp)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(web + "_" + txID + "_report", rpJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	logger.Info("Report Successful! , Transaction ID = " + txID + "\n")

	return shim.Success(nil)
}

func (t *SimpleChaincode) history(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//       0
	//	txID or reportID
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	keyID := args[0]

	fmt.Printf("- start getHistoryForMarble: %s\n", keyID)

	resultsIterator, err := stub.GetHistoryForKey(keyID)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryForMarble returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (t *SimpleChaincode) queryBySeller(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//		0
	//	sellerRRN
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	sellerRRN := args[0]

	queryString := fmt.Sprintf("{\"selector\":{\"sellerRRN\":\"%s\"}}", sellerRRN)

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

func (t *SimpleChaincode) queryByBuyer(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//		0
	//	buyerRRN
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	buyerRRN := args[0]

	queryString := fmt.Sprintf("{\"selector\":{\"buyerRRN\":\"%s\"}}", buyerRRN)

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// =========================================================================================
// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	buffer, err := constructQueryResponseFromIterator(resultsIterator)
	if err != nil {
		return nil, err
	}

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}

// ===========================================================================================
// constructQueryResponseFromIterator constructs a JSON array containing query results from
// a given result iterator
// ===========================================================================================
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) (*bytes.Buffer, error) {
	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString("&&")
		}
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}

	return &buffer, nil
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		logger.Errorf("Error starting Simple chaincode: %s", err)
	}
}
