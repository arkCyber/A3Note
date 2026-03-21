// Additional tests for export functionality

#[cfg(test)]
mod export_tests {
    use super::super::export::*;
    use tempfile::TempDir;
    use std::fs;

    #[test]
    fn test_export_to_html_with_links() {
        let markdown = "[Link text](https://example.com)";
        let result = export_to_html(markdown, "Link Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<a href=\"https://example.com\">Link text</a>"));
    }

    #[test]
    fn test_export_to_html_with_images() {
        let markdown = "![Alt text](image.png)";
        let result = export_to_html(markdown, "Image Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<img"));
        assert!(html.contains("alt=\"Alt text\""));
    }

    #[test]
    fn test_export_to_html_with_blockquote() {
        let markdown = "> This is a quote";
        let result = export_to_html(markdown, "Quote Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<blockquote>"));
    }

    #[test]
    fn test_export_to_html_with_lists() {
        let markdown = "- Item 1\n- Item 2\n- Item 3";
        let result = export_to_html(markdown, "List Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<ul>"));
        assert!(html.contains("<li>Item 1</li>"));
    }

    #[test]
    fn test_export_to_html_with_ordered_list() {
        let markdown = "1. First\n2. Second\n3. Third";
        let result = export_to_html(markdown, "Ordered List Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<ol>"));
    }

    #[test]
    fn test_export_to_html_includes_css() {
        let markdown = "# Test";
        let result = export_to_html(markdown, "CSS Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<style>"));
        assert!(html.contains("font-family"));
        assert!(html.contains("@media print"));
    }

    #[test]
    fn test_export_to_html_includes_meta_tags() {
        let markdown = "# Test";
        let result = export_to_html(markdown, "Meta Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("<meta charset=\"UTF-8\">"));
        assert!(html.contains("<meta name=\"viewport\""));
    }

    #[tokio::test]
    async fn test_export_file_to_html_creates_file() {
        let temp_dir = TempDir::new().unwrap();
        let output_path = temp_dir.path().join("output.html");
        
        let result = export_file_to_html(
            "# Test Content".to_string(),
            "Test".to_string(),
            output_path.to_string_lossy().to_string(),
        ).await;
        
        assert!(result.is_ok());
        assert!(output_path.exists());
        
        let content = fs::read_to_string(&output_path).unwrap();
        assert!(content.contains("<h1>Test Content</h1>"));
    }

    #[tokio::test]
    async fn test_export_file_to_text_creates_file() {
        let temp_dir = TempDir::new().unwrap();
        let output_path = temp_dir.path().join("output.txt");
        
        let result = export_file_to_text(
            "# Test\n\nThis is **bold**.".to_string(),
            output_path.to_string_lossy().to_string(),
        ).await;
        
        assert!(result.is_ok());
        assert!(output_path.exists());
        
        let content = fs::read_to_string(&output_path).unwrap();
        assert!(content.contains("Test"));
        assert!(content.contains("bold"));
        assert!(!content.contains("**"));
    }

    #[test]
    fn test_export_to_text_removes_headers() {
        let markdown = "# Header 1\n## Header 2\n### Header 3";
        let result = export_to_text(markdown);
        
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(!text.contains("#"));
        assert!(text.contains("Header 1"));
        assert!(text.contains("Header 2"));
    }

    #[test]
    fn test_export_to_text_removes_bold_italic() {
        let markdown = "**bold** and *italic* and ~~strikethrough~~";
        let result = export_to_text(markdown);
        
        assert!(result.is_ok());
        let text = result.unwrap();
        assert!(!text.contains("**"));
        assert!(!text.contains("*"));
        assert!(!text.contains("~~"));
    }

    #[test]
    fn test_export_to_text_preserves_content() {
        let markdown = "This is plain text.";
        let result = export_to_text(markdown);
        
        assert!(result.is_ok());
        let text = result.unwrap();
        assert_eq!(text.trim(), "This is plain text.");
    }

    #[test]
    fn test_export_empty_content() {
        let result = export_to_html("", "Empty");
        assert!(result.is_ok());
        
        let result = export_to_text("");
        assert!(result.is_ok());
    }

    #[test]
    fn test_export_very_long_content() {
        let long_content = "# Test\n\n".to_string() + &"x".repeat(10000);
        let result = export_to_html(&long_content, "Long Test");
        
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.len() > 10000);
    }
}
