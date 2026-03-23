# 🔄 A3Note 数据同步解决方案设计

**设计日期**: 2026-03-23  
**版本**: 1.0  
**标准**: 航空航天级

---

## 📋 需求分析

### 核心需求
1. ✅ 多设备同步（Windows, macOS, Linux, iOS, Android）
2. ✅ 本地优先架构
3. ✅ 数据安全和隐私保护
4. ✅ 离线工作能力
5. ✅ 冲突解决机制

### 参考 Obsidian 的经验教训
- ✅ 移动端（特别是 iOS）后台同步是最大挑战
- ✅ 不要同时使用多种同步方式（易导致冲突）
- ✅ 端到端加密是必需的
- ✅ 版本历史记录很重要
- ✅ 同步服务可作为商业模式

---

## 🎯 推荐方案：混合同步架构

### 方案概述

采用**三层同步架构**，提供灵活性和可靠性：

```
┌─────────────────────────────────────────────────────┐
│              A3Note 同步架构                          │
├─────────────────────────────────────────────────────┤
│  Layer 1: 官方同步服务 (推荐，付费)                    │
│  Layer 2: 第三方云存储 (免费，需配置)                  │
│  Layer 3: 自建同步服务 (高级用户)                      │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Layer 1: 官方同步服务（推荐）

### 架构设计

```typescript
// 官方同步服务架构
┌──────────────┐     WebSocket/HTTPS      ┌──────────────┐
│   A3Note     │ ◄──────────────────────► │  Sync Server │
│   Client     │      端到端加密           │   (云端)     │
└──────────────┘                          └──────────────┘
       │                                          │
       │                                          │
   本地存储                                   云端存储
   + 索引                                    + 版本历史
```

### 技术栈

**后端**:
- **服务器**: Rust + Actix-web (高性能)
- **数据库**: PostgreSQL (元数据) + S3 (文件存储)
- **实时通信**: WebSocket (实时同步)
- **加密**: AES-256-GCM (端到端加密)

**前端**:
- **同步引擎**: TypeScript + IndexedDB (本地缓存)
- **冲突解决**: 三路合并算法
- **增量同步**: 仅传输变更部分

### 核心功能

#### 1. 端到端加密
```typescript
// src/services/sync/encryption.ts
export class SyncEncryption {
  // 使用用户密码派生密钥
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // 加密文件内容
  async encryptFile(content: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  }
  
  // 解密文件内容
  async decryptFile(encrypted: EncryptedData, key: CryptoKey): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encrypted.iv) },
      key,
      new Uint8Array(encrypted.data)
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
```

#### 2. 增量同步引擎
```typescript
// src/services/sync/sync-engine.ts
export class SyncEngine {
  private ws: WebSocket | null = null;
  private syncQueue: SyncOperation[] = [];
  
  // 连接到同步服务器
  async connect(token: string): Promise<void> {
    this.ws = new WebSocket(`wss://sync.a3note.com?token=${token}`);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleSyncMessage(message);
    };
    
    this.ws.onopen = () => {
      log.info('[Sync] Connected to sync server');
      this.startSync();
    };
  }
  
  // 监听本地文件变更
  watchLocalChanges(): void {
    // 使用 FileWatcher 监听变更
    useFileWatcher(workspacePath, (event) => {
      if (event.type === 'modified' || event.type === 'created') {
        this.queueSync({
          type: 'upload',
          path: event.path,
          timestamp: Date.now()
        });
      } else if (event.type === 'deleted') {
        this.queueSync({
          type: 'delete',
          path: event.path,
          timestamp: Date.now()
        });
      }
    });
  }
  
  // 同步文件
  async syncFile(path: string): Promise<void> {
    const localFile = await this.getLocalFile(path);
    const remoteFile = await this.getRemoteFile(path);
    
    if (!remoteFile) {
      // 远程不存在，上传
      await this.uploadFile(localFile);
    } else if (!localFile) {
      // 本地不存在，下载
      await this.downloadFile(remoteFile);
    } else {
      // 都存在，检查冲突
      await this.resolveConflict(localFile, remoteFile);
    }
  }
  
  // 冲突解决
  async resolveConflict(local: FileInfo, remote: FileInfo): Promise<void> {
    if (local.timestamp > remote.timestamp) {
      // 本地更新，上传
      await this.uploadFile(local);
    } else if (remote.timestamp > local.timestamp) {
      // 远程更新，下载
      await this.downloadFile(remote);
    } else {
      // 时间戳相同，内容冲突
      // 创建冲突副本
      await this.createConflictCopy(local, remote);
    }
  }
}
```

#### 3. 版本历史
```typescript
// src/services/sync/version-history.ts
export class VersionHistory {
  // 保存版本快照
  async saveVersion(path: string, content: string): Promise<Version> {
    const version: Version = {
      id: generateId(),
      path,
      content,
      timestamp: Date.now(),
      hash: await this.hashContent(content)
    };
    
    await invoke('save_version', { version });
    return version;
  }
  
  // 获取版本历史
  async getVersions(path: string, limit: number = 50): Promise<Version[]> {
    return await invoke('get_versions', { path, limit });
  }
  
  // 恢复到指定版本
  async restoreVersion(versionId: string): Promise<void> {
    const version = await invoke('get_version', { versionId });
    await invoke('write_file_content', {
      path: version.path,
      content: version.content
    });
    
    log.info(`[VersionHistory] Restored ${version.path} to version ${versionId}`);
  }
}
```

### 定价策略（参考 Obsidian）

**免费版**:
- ✅ 本地使用无限制
- ✅ 第三方同步支持
- ❌ 无官方同步

**Standard 版** ($4/月):
- ✅ 1 个同步库
- ✅ 1GB 存储
- ✅ 单文件 5MB
- ✅ 30 天版本历史

**Plus 版** ($8/月):
- ✅ 10 个同步库
- ✅ 100GB 存储
- ✅ 单文件 200MB
- ✅ 1 年版本历史
- ✅ 优先支持

---

## 🌐 Layer 2: 第三方云存储（免费）

### 支持的云存储

1. **iCloud Drive** (Apple 用户推荐)
2. **Google Drive**
3. **Dropbox**
4. **OneDrive**
5. **WebDAV** (自建)
6. **S3 兼容存储**

### 实现方案

```typescript
// src/services/sync/cloud-sync.ts
export class CloudSyncService {
  private provider: CloudProvider;
  
  // 支持的云存储提供商
  async setupProvider(type: CloudProviderType, config: CloudConfig): Promise<void> {
    switch (type) {
      case 'icloud':
        this.provider = new ICloudProvider(config);
        break;
      case 'gdrive':
        this.provider = new GoogleDriveProvider(config);
        break;
      case 'dropbox':
        this.provider = new DropboxProvider(config);
        break;
      case 'onedrive':
        this.provider = new OneDriveProvider(config);
        break;
      case 'webdav':
        this.provider = new WebDAVProvider(config);
        break;
      case 's3':
        this.provider = new S3Provider(config);
        break;
    }
    
    await this.provider.authenticate();
  }
  
  // 同步文件
  async sync(): Promise<SyncResult> {
    const localFiles = await this.scanLocalFiles();
    const remoteFiles = await this.provider.listFiles();
    
    const operations = this.calculateSyncOperations(localFiles, remoteFiles);
    
    for (const op of operations) {
      switch (op.type) {
        case 'upload':
          await this.provider.uploadFile(op.path, op.content);
          break;
        case 'download':
          await this.provider.downloadFile(op.path);
          break;
        case 'delete':
          await this.provider.deleteFile(op.path);
          break;
      }
    }
    
    return {
      uploaded: operations.filter(o => o.type === 'upload').length,
      downloaded: operations.filter(o => o.type === 'download').length,
      deleted: operations.filter(o => o.type === 'delete').length
    };
  }
}
```

### 移动端特殊处理（iOS）

```typescript
// src/services/sync/mobile-sync.ts
export class MobileSyncService {
  // iOS 后台同步限制处理
  async setupBackgroundSync(): Promise<void> {
    if (platform === 'ios') {
      // 使用 iOS 后台任务 API
      await this.registerBackgroundTask();
      
      // 监听应用状态变化
      this.watchAppState();
    }
  }
  
  // 注册后台任务
  private async registerBackgroundTask(): Promise<void> {
    // 使用 Capacitor 或 Tauri 的后台任务 API
    // 在应用进入后台时触发同步
  }
  
  // 智能同步策略
  async smartSync(): Promise<void> {
    // 检查网络状态
    const isWiFi = await this.isWiFiConnected();
    const batteryLevel = await this.getBatteryLevel();
    
    if (isWiFi && batteryLevel > 20) {
      // 完整同步
      await this.fullSync();
    } else if (batteryLevel > 50) {
      // 仅同步重要文件
      await this.prioritySync();
    } else {
      // 延迟同步
      await this.deferSync();
    }
  }
}
```

---

## 🔧 Layer 3: 自建同步服务（高级）

### 使用 Syncthing（点对点同步）

**优势**:
- ✅ 完全免费
- ✅ 点对点直接同步
- ✅ 无需中心服务器
- ✅ 开源可审计

**集成方案**:
```typescript
// src/services/sync/syncthing-integration.ts
export class SyncthingIntegration {
  private syncthingApi: string = 'http://localhost:8384';
  
  // 配置 Syncthing
  async setup(folderId: string, folderPath: string): Promise<void> {
    await this.addFolder({
      id: folderId,
      path: folderPath,
      type: 'sendreceive',
      rescanIntervalS: 60,
      fsWatcherEnabled: true
    });
  }
  
  // 添加设备
  async addDevice(deviceId: string, name: string): Promise<void> {
    await fetch(`${this.syncthingApi}/rest/config/devices`, {
      method: 'POST',
      headers: { 'X-API-Key': this.apiKey },
      body: JSON.stringify({
        deviceID: deviceId,
        name,
        addresses: ['dynamic']
      })
    });
  }
  
  // 监控同步状态
  async getSyncStatus(): Promise<SyncStatus> {
    const response = await fetch(`${this.syncthingApi}/rest/db/status?folder=${this.folderId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return await response.json();
  }
}
```

### 使用 Git（技术用户）

```typescript
// src/services/sync/git-sync.ts
export class GitSyncService {
  private repoPath: string;
  
  // 自动提交和推送
  async autoCommitAndPush(): Promise<void> {
    // 检查是否有变更
    const hasChanges = await this.hasUncommittedChanges();
    
    if (hasChanges) {
      // 添加所有变更
      await this.gitAdd('.');
      
      // 提交
      const message = `Auto-sync: ${new Date().toISOString()}`;
      await this.gitCommit(message);
      
      // 推送
      await this.gitPush();
    }
  }
  
  // 拉取远程变更
  async pull(): Promise<void> {
    try {
      await this.gitPull();
    } catch (error) {
      // 处理合并冲突
      await this.resolveConflicts();
    }
  }
  
  // 冲突解决
  private async resolveConflicts(): Promise<void> {
    const conflicts = await this.getConflicts();
    
    for (const file of conflicts) {
      // 创建冲突副本
      await this.createConflictCopy(file);
      
      // 使用本地版本
      await this.gitCheckout('--ours', file);
    }
    
    await this.gitAdd('.');
    await this.gitCommit('Resolved conflicts');
  }
}
```

---

## 🛡️ 安全性设计

### 1. 端到端加密

```typescript
// 所有同步数据在本地加密，服务器无法读取
┌──────────────┐                    ┌──────────────┐
│   本地明文    │                    │   本地明文    │
└──────┬───────┘                    └──────▲───────┘
       │ 加密                               │ 解密
       ▼                                    │
┌──────────────┐    传输加密数据     ┌──────────────┐
│   加密数据    │ ──────────────────► │   加密数据    │
└──────────────┘                    └──────────────┘
```

### 2. 零知识架构

- ✅ 服务器不存储用户密钥
- ✅ 服务器无法解密用户数据
- ✅ 密钥派生在本地完成

### 3. 传输安全

- ✅ TLS 1.3 加密传输
- ✅ 证书固定（Certificate Pinning）
- ✅ WebSocket Secure (WSS)

---

## ⚡ 性能优化

### 1. 增量同步

```typescript
// 仅传输变更的部分，而非整个文件
interface FileDelta {
  path: string;
  operations: DeltaOperation[];  // 插入、删除、修改操作
}

// 使用差分算法
async calculateDelta(oldContent: string, newContent: string): Promise<FileDelta> {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldContent, newContent);
  dmp.diff_cleanupSemantic(diffs);
  
  return {
    path: filePath,
    operations: diffs.map(diff => ({
      type: diff[0],  // -1: 删除, 0: 不变, 1: 插入
      text: diff[1]
    }))
  };
}
```

### 2. 压缩传输

```typescript
// 使用 gzip 压缩减少带宽
async compressAndUpload(content: string): Promise<void> {
  const compressed = await gzip(content);
  await this.upload(compressed);
}
```

### 3. 智能批处理

```typescript
// 批量处理多个文件变更
class SyncBatcher {
  private batch: SyncOperation[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  add(operation: SyncOperation): void {
    this.batch.push(operation);
    
    // 延迟 500ms 批量处理
    if (this.batchTimer) clearTimeout(this.batchTimer);
    this.batchTimer = setTimeout(() => this.flush(), 500);
  }
  
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    await this.syncEngine.syncBatch(this.batch);
    this.batch = [];
  }
}
```

---

## 🔄 冲突解决策略

### 1. 自动解决（无损）

```typescript
// 三路合并算法
async threeWayMerge(base: string, local: string, remote: string): Promise<string> {
  const dmp = new DiffMatchPatch();
  
  // 计算本地和远程相对于基础版本的差异
  const localDiffs = dmp.diff_main(base, local);
  const remoteDiffs = dmp.diff_main(base, remote);
  
  // 应用两组差异
  const patches = dmp.patch_make(base, localDiffs);
  const [merged, success] = dmp.patch_apply(patches, remote);
  
  if (success.every(s => s)) {
    return merged;
  } else {
    // 无法自动合并，创建冲突副本
    throw new ConflictError('Cannot auto-merge');
  }
}
```

### 2. 手动解决（冲突副本）

```typescript
// 创建冲突副本，保留两个版本
async createConflictCopy(local: FileInfo, remote: FileInfo): Promise<void> {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const conflictPath = local.path.replace('.md', ` (conflict ${timestamp}).md`);
  
  // 保存远程版本为冲突副本
  await invoke('write_file_content', {
    path: conflictPath,
    content: remote.content
  });
  
  // 本地版本保持不变
  log.warn(`[Sync] Conflict detected, created copy: ${conflictPath}`);
}
```

---

## 📱 移动端优化

### iOS 特殊处理

```typescript
// iOS 后台限制处理
export class iOSSyncOptimizer {
  // 使用后台任务 API
  async scheduleBackgroundSync(): Promise<void> {
    if (Capacitor.getPlatform() === 'ios') {
      await BackgroundTask.schedule({
        taskId: 'sync-task',
        delay: 900000,  // 15 分钟
        periodic: true
      });
    }
  }
  
  // 应用进入前台时立即同步
  async setupForegroundSync(): Promise<void> {
    App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        await this.quickSync();
      }
    });
  }
  
  // 快速同步（仅元数据）
  async quickSync(): Promise<void> {
    // 仅同步文件列表和元数据
    const remoteManifest = await this.fetchManifest();
    const localManifest = await this.getLocalManifest();
    
    // 标记需要同步的文件
    const needsSync = this.compareManifests(localManifest, remoteManifest);
    
    // 在后台逐步同步
    this.queueBackgroundSync(needsSync);
  }
}
```

---

## 🎯 推荐实施路线图

### Phase 1: 基础同步（1-2 个月）
- ✅ 实现本地文件监视
- ✅ 实现基础云存储支持（iCloud, Google Drive）
- ✅ 实现冲突检测和副本创建
- ✅ 基础 UI 界面

### Phase 2: 官方同步服务（2-3 个月）
- ✅ 搭建同步服务器（Rust + PostgreSQL）
- ✅ 实现端到端加密
- ✅ 实现增量同步
- ✅ 实现版本历史
- ✅ WebSocket 实时同步

### Phase 3: 移动端优化（1-2 个月）
- ✅ iOS 后台同步优化
- ✅ Android 同步优化
- ✅ 智能同步策略
- ✅ 离线队列

### Phase 4: 高级功能（1 个月）
- ✅ Syncthing 集成
- ✅ Git 同步支持
- ✅ 选择性同步
- ✅ 同步统计和监控

---

## 💰 商业模式建议

### 免费版
- ✅ 本地使用
- ✅ 第三方云存储
- ✅ Syncthing/Git 支持

### 付费版（同步服务）
- **Standard**: $4/月
  - 1GB 存储
  - 1 个同步库
  - 30 天历史
  
- **Plus**: $8/月
  - 100GB 存储
  - 10 个同步库
  - 1 年历史
  - 优先支持

**预期收入**:
- 10,000 用户 × 10% 付费率 × $4/月 = $4,000/月
- 100,000 用户 × 10% 付费率 × $4/月 = $40,000/月

---

## ✅ 最终建议

### 推荐方案组合

**个人用户**:
1. 免费用户 → iCloud/Google Drive
2. 付费用户 → 官方同步服务

**团队用户**:
1. 小团队 → Syncthing (免费)
2. 大团队 → 官方同步服务 (Plus)

**技术用户**:
1. Git 同步 (版本控制)
2. 自建 WebDAV/S3

### 关键成功因素

1. ✅ **移动端体验** - 必须解决 iOS 后台同步
2. ✅ **数据安全** - 端到端加密不可妥协
3. ✅ **冲突处理** - 自动合并 + 冲突副本
4. ✅ **性能优化** - 增量同步 + 压缩
5. ✅ **用户体验** - 一键设置，自动同步

---

**🎯 建议优先实现 Layer 1（官方同步服务）+ Layer 2（iCloud/Google Drive），这样可以覆盖 90% 的用户需求！**
