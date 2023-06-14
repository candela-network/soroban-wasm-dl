
use base64::Engine;
use wasm_bindgen::prelude::*;


/// input: the base64 representation of the WASM file 
///   must be put in an HTML element whose id is "input"
/// output: the contract interface is return as a string in an HTML 
///   element whose id is "output"
#[wasm_bindgen]
#[no_mangle]
pub fn getSpec() {
    let document = web_sys::window().unwrap().document().unwrap();
    let wasm = document.get_element_by_id("input").unwrap().inner_html();

    let wasm_bytes = base64::engine::general_purpose::STANDARD.decode(wasm).unwrap();

    match soroban_spec::gen::rust::generate_from_wasm(&wasm_bytes.as_slice(), "file.wasm", None) {
        Ok(s) => {
            let output = format!("<pre><code class=\"hljs language-rust\">{}</code></pre>", s.to_string());
            document
            .get_element_by_id("output")
            .unwrap()
            .set_inner_html(&output.as_str())
        },
        Err(e) => {
            let o = format!("{:?}", e);
            document
            .get_element_by_id("output")
            .unwrap()
            .set_inner_html(o.to_string().as_str())
        }
    }

   
}
