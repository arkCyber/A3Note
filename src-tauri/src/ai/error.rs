// AI Error Types - Aerospace Grade
// Comprehensive error handling for AI operations

use thiserror::Error;

#[derive(Error, Debug)]
pub enum AIError {
    #[error("Model not loaded")]
    ModelNotLoaded,

    #[error("Model loading failed: {0}")]
    ModelLoadError(String),

    #[error("Inference failed: {0}")]
    InferenceError(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Model file not found: {0}")]
    ModelFileNotFound(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl AIError {
    /// Get error severity level
    pub fn severity(&self) -> ErrorSeverity {
        match self {
            AIError::ModelNotLoaded => ErrorSeverity::Warning,
            AIError::ModelLoadError(_) => ErrorSeverity::Error,
            AIError::InferenceError(_) => ErrorSeverity::Error,
            AIError::InvalidConfig(_) => ErrorSeverity::Warning,
            AIError::InvalidRequest(_) => ErrorSeverity::Warning,
            AIError::ModelFileNotFound(_) => ErrorSeverity::Error,
            AIError::IoError(_) => ErrorSeverity::Error,
            AIError::SerializationError(_) => ErrorSeverity::Error,
            AIError::InternalError(_) => ErrorSeverity::Critical,
        }
    }

    /// Get user-friendly error message
    pub fn user_message(&self) -> String {
        match self {
            AIError::ModelNotLoaded => {
                "AI 模型未加载。请在设置中加载模型。".to_string()
            }
            AIError::ModelLoadError(msg) => {
                format!("模型加载失败: {}", msg)
            }
            AIError::InferenceError(msg) => {
                format!("AI 推理失败: {}", msg)
            }
            AIError::InvalidConfig(msg) => {
                format!("配置无效: {}", msg)
            }
            AIError::InvalidRequest(msg) => {
                format!("请求无效: {}", msg)
            }
            AIError::ModelFileNotFound(path) => {
                format!("模型文件未找到: {}", path)
            }
            AIError::IoError(e) => {
                format!("文件操作失败: {}", e)
            }
            AIError::SerializationError(e) => {
                format!("数据序列化失败: {}", e)
            }
            AIError::InternalError(msg) => {
                format!("内部错误: {}", msg)
            }
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ErrorSeverity {
    Warning,
    Error,
    Critical,
}

pub type AIResult<T> = Result<T, AIError>;
