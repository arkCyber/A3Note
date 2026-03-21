// Performance benchmarks for file operations
// Run with: cargo bench

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use std::fs;
use tempfile::TempDir;

fn create_test_file(dir: &TempDir, name: &str, size: usize) -> String {
    let path = dir.path().join(name);
    let content = "x".repeat(size);
    fs::write(&path, content).unwrap();
    path.to_string_lossy().to_string()
}

fn benchmark_file_read(c: &mut Criterion) {
    let mut group = c.benchmark_group("file_read");
    
    for size in [1024, 10_240, 102_400, 1_024_000].iter() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = create_test_file(&temp_dir, "test.md", *size);
        
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}KB", size / 1024)),
            size,
            |b, _| {
                b.iter(|| {
                    let content = fs::read_to_string(black_box(&file_path)).unwrap();
                    black_box(content);
                });
            },
        );
    }
    
    group.finish();
}

fn benchmark_file_write(c: &mut Criterion) {
    let mut group = c.benchmark_group("file_write");
    
    for size in [1024, 10_240, 102_400, 1_024_000].iter() {
        let content = "x".repeat(*size);
        
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}KB", size / 1024)),
            size,
            |b, _| {
                let temp_dir = TempDir::new().unwrap();
                let file_path = temp_dir.path().join("test.md");
                
                b.iter(|| {
                    fs::write(black_box(&file_path), black_box(&content)).unwrap();
                });
            },
        );
    }
    
    group.finish();
}

fn benchmark_atomic_write(c: &mut Criterion) {
    let mut group = c.benchmark_group("atomic_write");
    
    for size in [1024, 10_240, 102_400].iter() {
        let content = "x".repeat(*size);
        
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}KB", size / 1024)),
            size,
            |b, _| {
                let temp_dir = TempDir::new().unwrap();
                let file_path = temp_dir.path().join("test.md");
                let temp_path = file_path.with_extension("tmp");
                
                b.iter(|| {
                    fs::write(black_box(&temp_path), black_box(&content)).unwrap();
                    fs::rename(black_box(&temp_path), black_box(&file_path)).unwrap();
                });
            },
        );
    }
    
    group.finish();
}

fn benchmark_directory_listing(c: &mut Criterion) {
    let mut group = c.benchmark_group("directory_listing");
    
    for file_count in [10, 100, 1000].iter() {
        let temp_dir = TempDir::new().unwrap();
        
        // Create test files
        for i in 0..*file_count {
            let file_path = temp_dir.path().join(format!("file_{}.md", i));
            fs::write(&file_path, "test content").unwrap();
        }
        
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}_files", file_count)),
            file_count,
            |b, _| {
                b.iter(|| {
                    let entries: Vec<_> = fs::read_dir(black_box(temp_dir.path()))
                        .unwrap()
                        .collect();
                    black_box(entries);
                });
            },
        );
    }
    
    group.finish();
}

fn benchmark_search(c: &mut Criterion) {
    let mut group = c.benchmark_group("search");
    
    let temp_dir = TempDir::new().unwrap();
    
    // Create test files with searchable content
    for i in 0..100 {
        let content = format!("This is test file {} with keyword in line {}", i, i);
        let file_path = temp_dir.path().join(format!("file_{}.md", i));
        fs::write(&file_path, content).unwrap();
    }
    
    group.bench_function("search_keyword", |b| {
        b.iter(|| {
            let mut results = Vec::new();
            for entry in fs::read_dir(black_box(temp_dir.path())).unwrap() {
                if let Ok(entry) = entry {
                    if let Ok(content) = fs::read_to_string(entry.path()) {
                        if content.contains(black_box("keyword")) {
                            results.push(entry.path());
                        }
                    }
                }
            }
            black_box(results);
        });
    });
    
    group.finish();
}

criterion_group!(
    benches,
    benchmark_file_read,
    benchmark_file_write,
    benchmark_atomic_write,
    benchmark_directory_listing,
    benchmark_search
);

criterion_main!(benches);
