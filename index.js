const SorobanClient = require("soroban-client");
const xdr = SorobanClient.xdr;

function getLedgerKeyContractCode(contractId) {
  let ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: xdr.ScAddress.scAddressTypeContract(Buffer.from(contractId, "hex")),
      key: new xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
      bodyType: xdr.ContractEntryBodyType.dataEntry(),
    })
  );

  return ledgerKey.toXDR("base64");
}

let key = getLedgerKeyContractCode(
  "1148f54b069e04efc986ea107aa5420f90531048e1b237e6ce8268bbe0228cfa"
)
// AAAABgAAAAERSPVLBp4E78mG6hB6pUIPkFMQSOGyN+bOgmi74CKM+gAAABQAAAABAAAAAA==

let contractId = 
"1148f54b069e04efc986ea107aa5420f90531048e1b237e6ce8268bbe0228cfa"
let srv = new SorobanClient.Server(
  "https://rpc-futurenet.stellar.org:443")

// srv.getLedgerEntries([xdr.LedgerKey.contractData(
//   new xdr.LedgerKeyContractData({
//     contract: xdr.ScAddress.scAddressTypeContract(Buffer.from(contractId, "hex")),
//     key: new xdr.ScVal.scvLedgerKeyContractInstance(),
//     durability: xdr.ContractDataDurability.persistent(),
//     bodyType: xdr.ContractEntryBodyType.dataEntry(),
//   })
// )]).then(out => {
//   console.log(out)
// })

let c = SorobanClient.StrKey.encodeContract(Buffer.from(contractId, "hex"))
srv.getContractData(c, new xdr.ScVal.scvLedgerKeyContractInstance()).then(out => {
  console.log(out)
  let entry = xdr.LedgerEntryData.fromXDR(out.xdr, 'base64')
  let instance = new xdr.ScContractInstance({executable: entry.contractData().body().value().val()});

  xdr.ContractExecutable.contractExecutableWasm(instance.executable().value())
  let ledgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: xdr.ContractExecutable.contractExecutableWasm(instance.executable().value()).wasmHash(),
      bodyType: xdr.ContractEntryBodyType.dataEntry()
    })
  );

  let a = xdr.ContractExecutable.contractExecutableWasm(instance.executable().value())
  // let a = instance.executable()
  
  console.log(a.wasmHash().toString('hex'))
  let ledgerKey2 = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: instance.executable().value(),
      bodyType: xdr.ContractEntryBodyType.dataEntry()
    })
  );

  console.log(ledgerKey2.toXDR('base64'))
  })
  
// function getLedgerKeyWasmId(contractCodeLedgerEntryData) {
//   let contractCodeWasmHash = xdr.ContractCodeEntry.fromXDR(
//     contractCodeLedgerEntryData,
//     "base64"
//   )
//     .contractData()
//     .val()
//     .exec()
//     .wasmId();

//   let ledgerKey = xdr.LedgerKey.contractCode(
//     new xdr.LedgerKeyContractCode({
//       hash: contractCodeWasmHash,
//     })
//   );

//   return ledgerKey.toXDR("base64");
// }

// console.log(
//   getLedgerKeyWasmId(
//     "AAAABgAAAAERSPVLBp4E78mG6hB6pUIPkFMQSOGyN+bOgmi74CKM+gAAABQAAAABAAAAAAAAAAAAAAATAAAAAC9t++yXzsiyyNSriBZbRQaDsqPyBIX0zJ9M7DoUdcYGAAAAAAAA0Sc="
//   )
// );
