import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.7.0/es/highlight.min.js";
//  and it's easy to individually load & register additional languages
import rust from "https://unpkg.com/@highlightjs/cdn-assets@11.7.0/es/languages/rust.min.js";
const xdr = SorobanClient.xdr;
const { getSpec } = wasm_bindgen;

const hexToBytes = (hex) => {
  var bytes = [];

  for (var c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes;
};
function bytesToHex(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

const bufferToBase64 = async (data) => {
  // Use a FileReader to generate a base64 data URI
  const base64url = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([data]));
  });

  /*
    The result looks like 
    "data:application/octet-stream;base64,<your base64 data>", 
    so we split off the beginning:
    */
  return base64url.substring(base64url.indexOf(",") + 1);
};

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getContractDataType(contractCodeLedgerEntryData) {
  return xdr.LedgerEntryData.fromXDR(
    contractCodeLedgerEntryData,
    "base64"
  )
    .contractData().val().exec().switch().name
}

function getLedgerKeyWasmId(contractCodeLedgerEntryData) {

  let entry = xdr.LedgerEntryData.fromXDR(
    contractCodeLedgerEntryData,
    "base64"
  );

  let instance = new xdr.ScContractInstance({ executable: entry.contractData().body().value().val() });

  let exec = xdr.ContractExecutable.contractExecutableWasm(instance.executable())

  let h = exec.wasmHash().instance().executable().wasmHash() // why all this ?

  let ledgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: h,
      bodyType: xdr.ContractEntryBodyType.dataEntry()
    })
  );



  return ledgerKey;
}

async function getWasmCodeForContractId(contractId) {
  let server = new SorobanClient.Server(
    "https://rpc-futurenet.stellar.org:443"
  );


  try {

    let contractData = await server.getContractData(
      SorobanClient.StrKey.encodeContract(hexToBytes(contractId)),
      new xdr.ScVal.scvLedgerKeyContractInstance()
    );


    // switch (getContractDataType(contractData.xdr)) {
    //   case "sccontractExecutableToken":
    //     return {
    //       hash: undefined,
    //       code: undefined,
    //       version: undefined,
    //     };
    //     break;
    //   case "sccontractExecutableWasmRef":

    let wasmId = await getLedgerKeyWasmId(contractData.xdr);
    let wasmCode = await server.getLedgerEntries([wasmId]);
    let entry = xdr.LedgerEntryData.fromXDR(wasmCode.entries[0].xdr, "base64");
    return {
      hash: entry.contractCode().hash(),
      code: entry.contractCode().body().code(),
      version: wasmCode.entries[0].lastModifiedLedgerSeq,
    };

    //     break;


    //   default:

    //   throw "Not a contract"
    // }


  } catch (e) {
    console.log(e)
    throw "Not a contract"
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let id = urlParams.get('id')
let cid = id;
if (cid.length == 56)
  cid = SorobanClient.StrKey.decodeContract(cid).toString("hex");

try {

  let wasm = await getWasmCodeForContractId(cid);
  let name = id.substring(0, 6) + ".wasm";
  if (wasm.code != undefined) {

    console.log(wasm)
    let wasmCode = await bufferToBase64(wasm.code);

    document.getElementById(
      "link"
    ).innerHTML = `<a href="data:application/octet-stream;base64,${wasmCode}" download="${id + "_" + wasm.version}.wasm"><img src="file-type-wasm.svg" alt="wasm" width="64px"  />${name}</a><br />`;
    document.getElementById("input").style.display = "none";
    document.getElementById("input").innerHTML = wasmCode;
    await wasm_bindgen();
    wasm_bindgen.getSpec();
    let source = document.getElementsByTagName("code").item(0).innerHTML;
    source = source
      .replace(`file = "file.wasm"`, `\n  file="${id + "_" + wasm.version}.wasm"`)
      .replace(" , sha256", ",\n  sha256")
      .replaceAll("pub ", "\npub ")
      .replaceAll("{", "{\n")
      .replaceAll("fn ", "\n  fn ")
      .replaceAll("# ", "\n#")
      .replaceAll("}", "\n}")
      .replaceAll(" :: ", "::")
      .replaceAll(" : ", ": ")
      .replaceAll(" ! ", "!")
      .replaceAll(" = ", "=")
      .replaceAll(" &lt; ", "&lt;")
      .replaceAll(" &gt; ", "&gt;")
      .replaceAll("&amp; ", "&amp;");
    document.getElementsByTagName("code").item(0).innerHTML = source;
    hljs.registerLanguage("rust", rust);
    hljs.highlightAll();

    document.getElementById("output-wrapper").style.display = "block";
  } else {
    document.getElementById("error").innerHTML = `
        ${id}<br /> 
        is a wrapped token contract<br />`
  }
} catch (e) {
  document.getElementById("error").innerHTML = e
}
