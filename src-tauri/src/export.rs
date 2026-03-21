// Export functionality for converting markdown to various formats
// Supports HTML, PDF (via HTML), and plain text export

use crate::error::{A3Error, A3Result};
use pulldown_cmark::{html, Parser, Options};
use std::fs;
use log::{info, debug};
use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref LINK_REGEX: Regex = Regex::new(r"\[([^\]]+)\]\([^\)]+\)").unwrap();
}

/// Export markdown to HTML
/// 
/// # Arguments
/// * `markdown_content` - Markdown content to convert
/// * `title` - Document title for HTML
/// 
/// # Returns
/// * `Ok(String)` - HTML content
/// * `Err(A3Error)` - Error during conversion
pub fn export_to_html(markdown_content: &str, title: &str) -> A3Result<String> {
    info!("Exporting to HTML: {}", title);
    
    // Configure markdown parser options
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);
    
    // Parse markdown
    let parser = Parser::new_ext(markdown_content, options);
    
    // Convert to HTML
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    
    // Wrap in full HTML document
    let full_html = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }}
        h1, h2, h3, h4, h5, h6 {{
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }}
        code {{
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }}
        pre {{
            background: #f4f4f4;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
        }}
        pre code {{
            background: none;
            padding: 0;
        }}
        blockquote {{
            border-left: 4px solid #ddd;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
        }}
        th {{
            background: #f4f4f4;
            font-weight: 600;
        }}
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        img {{
            max-width: 100%;
            height: auto;
        }}
        @media print {{
            body {{
                max-width: 100%;
                padding: 1rem;
            }}
        }}
    </style>
</head>
<body>
{}
</body>
</html>"#,
        title, html_output
    );
    
    debug!("HTML export completed: {} bytes", full_html.len());
    Ok(full_html)
}

/// Export markdown to plain text (strip formatting)
/// 
/// # Arguments
/// * `markdown_content` - Markdown content to convert
/// 
/// # Returns
/// * `Ok(String)` - Plain text content
pub fn export_to_text(markdown_content: &str) -> A3Result<String> {
    info!("Exporting to plain text");
    
    // Simple markdown stripping (basic implementation)
    let text = markdown_content
        .lines()
        .map(|line| {
            // Remove markdown headers
            let line = line.trim_start_matches('#').trim();
            // Remove bold/italic markers
            let line = line.replace("**", "").replace("*", "");
            // Remove links but keep text (using pre-compiled regex)
            let line = LINK_REGEX.replace_all(&line, "$1");
            line.to_string()
        })
        .collect::<Vec<_>>()
        .join("\n");
    
    debug!("Plain text export completed: {} bytes", text.len());
    Ok(text)
}

/// Tauri command to export file to HTML
#[tauri::command]
pub async fn export_file_to_html(
    content: String,
    title: String,
    output_path: String,
) -> Result<(), String> {
    info!("Exporting file to HTML: {}", output_path);
    
    let html = export_to_html(&content, &title)
        .map_err(|e| e.to_string())?;
    
    fs::write(&output_path, html)
        .map_err(|e| A3Error::FileWriteError {
            path: output_path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    info!("HTML export saved to: {}", output_path);
    Ok(())
}

/// Tauri command to export file to plain text
#[tauri::command]
pub async fn export_file_to_text(
    content: String,
    output_path: String,
) -> Result<(), String> {
    info!("Exporting file to text: {}", output_path);
    
    let text = export_to_text(&content)
        .map_err(|e| e.to_string())?;
    
    fs::write(&output_path, text)
        .map_err(|e| A3Error::FileWriteError {
            path: output_path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    info!("Text export saved to: {}", output_path);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_to_html() {
        let markdown = "# Hello World\n\nThis is **bold** and *italic*.";
        let result = export_to_html(markdown, "Test Document");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<h1>Hello World</h1>"));
        assert!(html.contains("<strong>bold</strong>"));
        assert!(html.contains("<em>italic</em>"));
        assert!(html.contains("<!DOCTYPE html>"));
    }

    #[test]
    fn test_export_to_text() {
        let markdown = "# Hello World\n\nThis is **bold** and *italic*.";
        let result = export_to_text(markdown);
        
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(text.contains("Hello World"));
        assert!(text.contains("bold"));
        assert!(!text.contains("**"));
        assert!(!text.contains("#"));
    }

    #[test]
    fn test_export_tables() {
        let markdown = r#"| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |"#;
        
        let result = export_to_html(markdown, "Table Test");
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<table>"));
        assert!(html.contains("<th>Header 1</th>"));
    }

    #[test]
    fn test_export_code_blocks() {
        let markdown = "```rust\nfn main() {}\n```";
        let result = export_to_html(markdown, "Code Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<pre>"));
        assert!(html.contains("<code>"));
    }
    
    #[test]
    fn test_export_with_links() {
        let markdown = "[Link text](https://example.com)";
        let result = export_to_html(markdown, "Link Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<a href=\"https://example.com\">Link text</a>"));
    }

    #[test]
    fn test_export_with_images() {
        let markdown = "![Alt text](image.png)";
        let result = export_to_html(markdown, "Image Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<img"));
        assert!(html.contains("alt=\"Alt text\""));
    }
}
