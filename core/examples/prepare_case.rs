use std::io::{self, BufRead};

use boardstudio_core::CoreEngine;

fn main() {
    let stdin = io::stdin();
    let mut engine = CoreEngine::new();

    for line in stdin.lock().lines() {
        let line = line.expect("read request from stdin");
        if line.trim().is_empty() {
            continue;
        }
        println!("{}", engine.request(&line));
    }
}
