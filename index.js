const SorobanClient = require("soroban-client");
const xdr = SorobanClient.xdr;

function getLedgerKeyContractCode(contractId) {
  let ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contractId: Buffer.from(contractId, "hex"),
      key: new xdr.ScVal.scvLedgerKeyContractExecutable(),
    })
  );

  return ledgerKey.toXDR("base64");
}

console.log(
  getLedgerKeyContractCode(
    "af9a2527e3b3b5571d63b0246ba32b7d31a5323766df7c60dfc0b3e3ba6fdf23"
  )
);

function getLedgerKeyWasmId(contractCodeLedgerEntryData) {
  let contractCodeWasmHash = xdr.LedgerEntryData.fromXDR(
    contractCodeLedgerEntryData,
    "base64"
  )
    .contractData()
    .val()
    .exec()
    .wasmId();

  let ledgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: contractCodeWasmHash,
    })
  );

  return ledgerKey.toXDR("base64");
}

console.log(
  getLedgerKeyWasmId(
    "AAAABq+aJSfjs7VXHWOwJGujK30xpTI3Zt98YN/As+O6b98jAAAAFAAAABIAAAAAZBYoEJT3IaPMMk3FoRmnEQHoDxewPZL+Uor+xWI4uII="
  )
);
