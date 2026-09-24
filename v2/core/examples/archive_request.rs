use std::{env, fs, path::PathBuf};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args_os().skip(1);
    let request = fs::read_to_string(args.next().ok_or("request JSON path required")?)?;
    let output = PathBuf::from(args.next().ok_or("output directory required")?);
    let mut buffers = Vec::new();
    for path in args {
        buffers.push(fs::read(path)?);
    }
    let (reply, outputs) = boardstudio_core::archive::request(&request, &buffers);
    println!("{reply}");
    fs::create_dir_all(&output)?;
    for (index, bytes) in outputs.iter().enumerate() {
        fs::write(output.join(format!("{index}.bin")), bytes)?;
    }
    Ok(())
}
