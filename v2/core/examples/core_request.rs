use std::io::{self, BufRead};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut engine = boardstudio_core::CoreEngine::new();
    for line in io::stdin().lock().lines() {
        let request = line?;
        if !request.trim().is_empty() {
            println!("{}", engine.request(&request));
        }
    }
    Ok(())
}
