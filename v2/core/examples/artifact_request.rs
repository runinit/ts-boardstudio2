use std::io::{self, BufRead};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    for line in io::stdin().lock().lines() {
        let request = line?;
        if request.trim().is_empty() {
            continue;
        }
        println!("{}", boardstudio_core::artifact::request(&request));
    }
    Ok(())
}
