# 文件大小限制配置

## 📋 概述

为了更好地管理文件上传和处理，我们引入了全局文件大小限制配置。通过统一的常量管理，可以轻松调整文件大小限制，并确保整个应用的一致性。

## 🔧 配置说明

### 全局常量定义

```typescript
// 文件大小限制配置
const MAX_FILE_SIZE_MB = 25; // 最大文件大小限制（MB）
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 转换为字节
```

### 辅助函数

```typescript
// 文件大小检查辅助函数
function isFileSizeExceeded(sizeInBytes: number): boolean {
  return sizeInBytes > MAX_FILE_SIZE_BYTES;
}

function formatFileSize(sizeInBytes: number): string {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return `${sizeInMB.toFixed(2)}MB`;
}

function getFileSizeErrorMessage(sizeInBytes: number, url: string, logID: string): string {
  return `[${logID}] 文件过大 (${formatFileSize(sizeInBytes)}，限制${MAX_FILE_SIZE_MB}MB): ${url}`;
}
```

## 🚀 使用方式

### 1. 检查文件大小

```typescript
// 检查Content-Length头部
const contentLength = response.headers.get("content-length");
if (contentLength) {
  const fileSizeInBytes = parseInt(contentLength);
  if (isFileSizeExceeded(fileSizeInBytes)) {
    console.warn(getFileSizeErrorMessage(fileSizeInBytes, url, logID));
    return { extension: ".file", success: false };
  }
}

// 检查实际文件大小
const arrayBuffer = await response.arrayBuffer();
const fileSizeInBytes = arrayBuffer.byteLength;
if (isFileSizeExceeded(fileSizeInBytes)) {
  console.warn(getFileSizeErrorMessage(fileSizeInBytes, url, logID));
  return { extension: ".file", success: false };
}
```

### 2. 格式化文件大小显示

```typescript
console.log(`[${logID}] 文件下载成功，大小: ${formatFileSize(fileSizeInBytes)}`);
```

## 📊 配置优势

### 1. 统一管理
- **单一配置点**: 所有文件大小限制都通过 `MAX_FILE_SIZE_MB` 常量控制
- **易于修改**: 只需修改一个常量即可调整整个应用的文件大小限制
- **避免硬编码**: 消除代码中的魔法数字，提高可维护性

### 2. 类型安全
- **TypeScript支持**: 所有函数都有明确的类型定义
- **编译时检查**: 确保参数类型正确，减少运行时错误

### 3. 一致性
- **统一错误信息**: 使用 `getFileSizeErrorMessage` 确保错误信息格式一致
- **统一检查逻辑**: 使用 `isFileSizeExceeded` 确保检查逻辑一致
- **统一格式化**: 使用 `formatFileSize` 确保文件大小显示格式一致

## 🔧 自定义配置

### 修改文件大小限制

如需修改文件大小限制，只需更改 `MAX_FILE_SIZE_MB` 常量：

```typescript
// 修改为50MB限制
const MAX_FILE_SIZE_MB = 50;

// 修改为10MB限制
const MAX_FILE_SIZE_MB = 10;

// 修改为100MB限制
const MAX_FILE_SIZE_MB = 100;
```

### 环境变量支持（可选扩展）

可以通过环境变量来配置文件大小限制：

```typescript
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '25');
```

## 📈 测试验证

### 边界值测试

| 文件大小 | 是否允许 | 说明 |
|---------|---------|------|
| 1MB | ✅ 允许 | 正常文件 |
| 10MB | ✅ 允许 | 中等文件 |
| 25MB | ✅ 允许 | 边界值（恰好等于限制） |
| 25MB + 1字节 | ❌ 拒绝 | 超过限制 |
| 50MB | ❌ 拒绝 | 明显超过限制 |

### 错误信息示例

```
[test-4] 文件过大 (25.00MB，限制25MB): https://example.com/large-file.bin
[test-5] 文件过大 (50.00MB，限制25MB): https://example.com/very-large-file.bin
```

## 🎯 最佳实践

### 1. 双重检查
- **预检查**: 通过 Content-Length 头部进行预检查，避免下载过大文件
- **实际检查**: 下载完成后再次检查实际文件大小，确保准确性

### 2. 用户友好
- **清晰错误信息**: 明确告知用户文件过大和具体限制
- **统一格式**: 使用一致的文件大小格式（MB，保留2位小数）

### 3. 性能考虑
- **早期检查**: 尽早进行文件大小检查，避免不必要的处理
- **资源释放**: 对于过大文件，及时释放相关资源

## 🔮 未来扩展

1. **动态配置**: 支持运行时动态调整文件大小限制
2. **分类限制**: 不同文件类型设置不同的大小限制
3. **用户级别**: 根据用户权限设置不同的文件大小限制
4. **统计监控**: 记录文件大小分布和超限情况

## 📝 总结

通过引入全局文件大小限制配置，我们实现了：
- 统一的文件大小管理
- 更好的代码可维护性
- 一致的用户体验
- 类型安全的实现

这种配置方式为未来的功能扩展和维护提供了良好的基础。
