use boardstudio_core::artifact::builtin_catalogue;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let catalogue = builtin_catalogue()
        .map_err(|error| std::io::Error::other(format!("{:?}: {}", error.code, error.message)))?;
    println!("{}", serde_json::to_string_pretty(&catalogue)?);
    Ok(())
}
