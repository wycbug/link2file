import {
  basekit,
  FieldType,
  field,
  FieldComponent,
  FieldCode,
  FieldContext,
} from "@lark-opdev/block-basekit-server-api";
import { fromBuffer } from "file-type";

const { t } = field;

// 文件类型映射表 - MIME类型到文件扩展名
const MIME_TYPE_MAP = {
  // 文档类型
  "text/html": ".html",
  "text/htm": ".htm",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/rtf": ".rtf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "application/xml": ".xml",
  "text/xml": ".xml",
  "text/markdown": ".md",
  "text/x-markdown": ".md",

  // 图片类型
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/svg": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "image/tif": ".tif",
  "image/ico": ".ico",
  "image/icon": ".ico",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/avif": ".avif",

  // 音频类型
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/wave": ".wav",
  "audio/x-wav": ".wav",
  "audio/aac": ".aac",
  "audio/ogg": ".ogg",
  "audio/opus": ".opus",
  "audio/flac": ".flac",
  "audio/x-flac": ".flac",
  "audio/m4a": ".m4a",
  "audio/mp4": ".m4a",
  "audio/wma": ".wma",
  "audio/x-ms-wma": ".wma",

  // 视频类型
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/avi": ".avi",
  "video/x-msvideo": ".avi",
  "video/mov": ".mov",
  "video/quicktime": ".mov",
  "video/wmv": ".wmv",
  "video/x-ms-wmv": ".wmv",
  "video/flv": ".flv",
  "video/x-flv": ".flv",
  "video/mkv": ".mkv",
  "video/x-matroska": ".mkv",
  "video/3gpp": ".3gp",
  "video/3gpp2": ".3g2",

  // 代码和脚本类型
  "application/javascript": ".js",
  "text/javascript": ".js",
  "application/json": ".json",
  "text/css": ".css",
  "application/typescript": ".ts",
  "text/typescript": ".ts",
  "application/x-python": ".py",
  "text/x-python": ".py",
  "application/x-php": ".php",
  "text/x-php": ".php",
  "application/x-java": ".java",
  "text/x-java": ".java",
  "application/x-c": ".c",
  "text/x-c": ".c",
  "application/x-cpp": ".cpp",
  "text/x-cpp": ".cpp",
  "application/x-csharp": ".cs",
  "text/x-csharp": ".cs",
  "application/x-yaml": ".yaml",
  "text/yaml": ".yaml",
  "application/x-toml": ".toml",
  "text/toml": ".toml",

  // 压缩文件类型
  "application/zip": ".zip",
  "application/x-zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/x-rar": ".rar",
  "application/x-rar-compressed": ".rar",
  "application/x-7z-compressed": ".7z",
  "application/x-tar": ".tar",
  "application/gzip": ".gz",
  "application/x-gzip": ".gz",
  "application/x-bzip2": ".bz2",

  // 字体类型
  "font/woff": ".woff",
  "font/woff2": ".woff2",
  "application/font-woff": ".woff",
  "application/font-woff2": ".woff2",
  "font/ttf": ".ttf",
  "font/otf": ".otf",
  "application/x-font-ttf": ".ttf",
  "application/x-font-otf": ".otf",
  "font/eot": ".eot",
  "application/vnd.ms-fontobject": ".eot",

  // 其他常见类型
  "application/octet-stream": ".bin",
  "application/x-executable": ".exe",
  "application/x-msdownload": ".exe",
  "application/x-msi": ".msi",
  "application/x-deb": ".deb",
  "application/x-rpm": ".rpm",
  "application/x-dmg": ".dmg",
  "application/x-iso9660-image": ".iso",
};

// 支持的文件扩展名列表
const SUPPORTED_EXTENSIONS = [
  // 文档类型
  ".html",
  ".htm",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".rtf",
  ".txt",
  ".csv",
  ".xml",
  ".md",
  ".yaml",
  ".yml",
  ".toml",

  // 图片类型
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".tif",
  ".ico",
  ".heic",
  ".heif",
  ".avif",

  // 音频类型
  ".mp3",
  ".wav",
  ".aac",
  ".ogg",
  ".opus",
  ".flac",
  ".m4a",
  ".wma",

  // 视频类型
  ".mp4",
  ".webm",
  ".ogv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".mkv",
  ".3gp",
  ".3g2",

  // 代码和脚本类型
  ".js",
  ".ts",
  ".json",
  ".css",
  ".py",
  ".php",
  ".java",
  ".c",
  ".cpp",
  ".cs",
  ".rb",
  ".go",
  ".rs",
  ".swift",

  // 压缩文件类型
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".bz2",

  // 字体类型
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",

  // 其他常见类型
  ".bin",
  ".exe",
  ".msi",
  ".deb",
  ".rpm",
  ".dmg",
  ".iso",
];

// CDN域名检测策略配置
const CDN_DETECTION_STRATEGIES = {
  // 图片CDN - 优先使用Content-Type，URL扩展名作为备用
  image_cdns: {
    domains: [
      "qlogo.cn",
      "qpic.cn",
      "sinaimg.cn",
      "weibocdn.com",
      "xhscdn.com",
      "bilivideo.com",
      "hdslb.com",
      "googlevideo.com",
      "ytimg.com",
      "fbcdn.net",
      "cdninstagram.com",
      "twimg.com",
      "imagedelivery.net",
      "cloudinary.com",
      "imgur.com",
    ],
    strategy: "content_type_first", // Content-Type优先
    fallback: "url_extension",
    confidence: 0.9,
  },

  // 阿里云OSS - URL路径通常很准确
  aliyun_oss: {
    domains: [
      "aliyuncs.com",
      "alicdn.com",
      "oss-cn-beijing.aliyuncs.com",
      "oss-cn-shanghai.aliyuncs.com",
      "oss-cn-hangzhou.aliyuncs.com",
      "oss-cn-shenzhen.aliyuncs.com",
      "oss-cn-guangzhou.aliyuncs.com",
    ],
    strategy: "url_extension_first", // URL扩展名优先
    fallback: "content_type",
    confidence: 0.95,
  },

  // 腾讯云COS - 类似阿里云
  tencent_cos: {
    domains: [
      "myqcloud.com",
      "qcloudimg.com",
      "cos.ap-beijing.myqcloud.com",
      "cos.ap-shanghai.myqcloud.com",
      "cos.ap-guangzhou.myqcloud.com",
    ],
    strategy: "url_extension_first",
    fallback: "content_type",
    confidence: 0.95,
  },

  // GitHub/GitLab - 代码文件，URL扩展名很准确
  code_repos: {
    domains: [
      "github.com",
      "raw.githubusercontent.com",
      "gitlab.com",
      "gitee.com",
      "coding.net",
    ],
    strategy: "url_extension_first",
    fallback: "content_type",
    confidence: 0.98,
  },

  // 文档分享平台 - Content-Type通常准确
  document_platforms: {
    domains: [
      "docs.google.com",
      "drive.google.com",
      "onedrive.live.com",
      "sharepoint.com",
      "dropbox.com",
      "box.com",
    ],
    strategy: "content_type_first",
    fallback: "file_content",
    confidence: 0.85,
  },

  // 通用CDN - 需要文件内容检测
  generic_cdns: {
    domains: [
      "cloudfront.net",
      "amazonaws.com",
      "cloudflare.com",
      "fastly.com",
      "akamai.net",
      "jsdelivr.net",
      "unpkg.com",
    ],
    strategy: "file_content_first", // 文件内容优先
    fallback: "content_type",
    confidence: 0.8,
  },

  // 华为云CDN - URL扩展名通常准确
  huawei_cloud: {
    domains: [
      "huaweicloud.com",
      "myhuaweicloud.com",
      "obs.cn-beijing.myhuaweicloud.com",
      "obs.cn-shanghai.myhuaweicloud.com",
      "obs.cn-guangzhou.myhuaweicloud.com",
    ],
    strategy: "url_extension_first",
    fallback: "content_type",
    confidence: 0.92,
  },

  // 其他云存储CDN - URL扩展名优先
  other_cloud_storage: {
    domains: [
      "ksyun.com",
      "ksyuncs.com",
      "ksyuncdn.com", // 金山云
      "qiniucdn.com",
      "qnssl.com",
      "clouddn.com",
      "qbox.me", // 七牛云
      "upaiyun.com",
      "upyun.com",
      "upcdn.net", // 又拍云
      "bcebos.com",
      "baidubce.com", // 百度云
    ],
    strategy: "url_extension_first",
    fallback: "content_type",
    confidence: 0.9,
  },

  // 门户网站CDN - Content-Type优先
  portal_cdns: {
    domains: [
      "126.net",
      "163.com", // 网易
      "baidu.com",
      "sina.com",
      "weibo.com", // 门户网站
    ],
    strategy: "content_type_first",
    fallback: "url_extension",
    confidence: 0.8,
  },

  // 开发者CDN - URL扩展名很准确
  developer_cdns: {
    domains: [
      "maxcdn.com",
      "bootstrapcdn.com",
      "googleapis.com",
      "gstatic.com",
      "githubassets.com",
      "github.io",
      "raw.githubusercontent.com",
    ],
    strategy: "url_extension_first",
    fallback: "content_type",
    confidence: 0.95,
  },

  // 字节跳动系CDN - Content-Type优先
  bytedance_cdns: {
    domains: [
      "bytedance.com",
      "toutiao.com",
      "douyin.com",
      "tiktok.com",
      "tiktokcdn.com",
      "tiktokcdn-us.com",
      "tiktokcdn-ak.com",
      "tiktokcdn.cn",
      "aweme.com",
      "amemv.com",
      "zjcdn.com",
      "bytedance-ads.com",
      "douyinpic.com",
      "iesdouyin.com",
      "ixigua.com",
      "byteimg.com",
    ],
    strategy: "content_type_first",
    fallback: "url_extension",
    confidence: 0.88,
  },
};

// 检测方式枚举
enum DetectionMethod {
  CONTENT_TYPE = "content_type",
  URL_EXTENSION = "url_extension",
  FILE_CONTENT = "file_content",
}

// 检测结果接口
interface DetectionResult {
  extension: string;
  method: DetectionMethod;
  confidence: number;
  success: boolean;
}

// 根据域名获取最佳检测策略
function getBestDetectionStrategy(hostname: string): {
  strategy: string;
  fallback: string;
  confidence: number;
} {
  for (const [categoryName, config] of Object.entries(
    CDN_DETECTION_STRATEGIES
  )) {
    if (config.domains.some((domain) => hostname.includes(domain))) {
      console.log(
        `[CDN策略] 检测到${categoryName}域名: ${hostname}, 使用策略: ${config.strategy}`
      );
      return config;
    }
  }

  // 默认策略：Content-Type -> URL -> 文件内容
  return {
    strategy: "content_type_first",
    fallback: "url_extension",
    confidence: 0.7,
  };
}

// 单独的检测方法实现
async function detectByContentType(
  url: string,
  context: any,
  logID: string
): Promise<DetectionResult> {
  try {
    const headResponse = await context.fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
      },
    });

    const contentType = headResponse.headers.get("content-type") || "";
    const cleanContentType = contentType.split(";")[0].trim().toLowerCase();

    for (const [mimeType, ext] of Object.entries(MIME_TYPE_MAP)) {
      if (cleanContentType === mimeType.toLowerCase()) {
        return {
          extension: ext,
          method: DetectionMethod.CONTENT_TYPE,
          confidence: 0.85,
          success: true,
        };
      }
    }

    return {
      extension: "",
      method: DetectionMethod.CONTENT_TYPE,
      confidence: 0,
      success: false,
    };
  } catch (error) {
    return {
      extension: "",
      method: DetectionMethod.CONTENT_TYPE,
      confidence: 0,
      success: false,
    };
  }
}

async function detectByUrlExtension(
  url: string,
  logID: string
): Promise<DetectionResult> {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.split("/").pop();

    let urlExtension = "";

    // 从路径中提取扩展名
    if (lastSegment && lastSegment.includes(".")) {
      urlExtension = lastSegment.substring(lastSegment.lastIndexOf("."));
    }

    // 从查询参数中查找filename或format信息
    if (!urlExtension) {
      const searchParams = urlObj.searchParams;

      // 优先查找filename参数
      const filename =
        searchParams.get("filename") ||
        searchParams.get("name") ||
        searchParams.get("file");
      if (filename && filename.includes(".")) {
        urlExtension = filename.substring(filename.lastIndexOf("."));
      }

      // 如果没有filename，查找format参数（如小红书的imageView2/format/png）
      if (!urlExtension) {
        const format = searchParams.get("format");
        if (format) {
          urlExtension = `.${format.toLowerCase()}`;
        }
      }

      // 检查URL路径中的特殊格式参数（如 /format/png）
      if (!urlExtension) {
        const pathMatch = pathname.match(/\/format\/(\w+)/i);
        if (pathMatch && pathMatch[1]) {
          urlExtension = `.${pathMatch[1].toLowerCase()}`;
        }
      }

      // 检查imageView2等图片处理参数
      if (!urlExtension) {
        const imageViewMatch = urlObj.search.match(
          /imageView2[^&]*\/format\/(\w+)/i
        );
        if (imageViewMatch && imageViewMatch[1]) {
          urlExtension = `.${imageViewMatch[1].toLowerCase()}`;
        }
      }
    }

    if (
      urlExtension &&
      SUPPORTED_EXTENSIONS.includes(urlExtension.toLowerCase())
    ) {
      return {
        extension: urlExtension.toLowerCase(),
        method: DetectionMethod.URL_EXTENSION,
        confidence: 0.75,
        success: true,
      };
    }

    return {
      extension: "",
      method: DetectionMethod.URL_EXTENSION,
      confidence: 0,
      success: false,
    };
  } catch (error) {
    return {
      extension: "",
      method: DetectionMethod.URL_EXTENSION,
      confidence: 0,
      success: false,
    };
  }
}

async function detectByFileContent(
  url: string,
  context: any,
  logID: string
): Promise<DetectionResult> {
  try {
    // 先尝试下载文件头部
    const headerResponse = await context.fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
        Range: "bytes=0-8191",
      },
    });

    if (headerResponse.status === 206 || headerResponse.status === 200) {
      const arrayBuffer = await headerResponse.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const detectedExtension = await detectFileTypeFromBuffer(
        uint8Array,
        logID
      );

      if (detectedExtension !== ".file") {
        return {
          extension: detectedExtension,
          method: DetectionMethod.FILE_CONTENT,
          confidence: 0.95,
          success: true,
        };
      }
    }

    return {
      extension: "",
      method: DetectionMethod.FILE_CONTENT,
      confidence: 0,
      success: false,
    };
  } catch (error) {
    return {
      extension: "",
      method: DetectionMethod.FILE_CONTENT,
      confidence: 0,
      success: false,
    };
  }
}

// 并发检测所有方式
async function detectFileTypeConcurrently(
  url: string,
  context: any,
  logID: string
): Promise<DetectionResult> {
  console.log(`[${logID}] 开始并发检测文件类型: ${url}`);

  // 并发执行所有检测方式
  const [contentTypeResult, urlExtensionResult, fileContentResult] =
    await Promise.allSettled([
      detectByContentType(url, context, logID),
      detectByUrlExtension(url, logID),
      detectByFileContent(url, context, logID),
    ]);

  const results: DetectionResult[] = [];

  if (
    contentTypeResult.status === "fulfilled" &&
    contentTypeResult.value.success
  ) {
    results.push(contentTypeResult.value);
  }
  if (
    urlExtensionResult.status === "fulfilled" &&
    urlExtensionResult.value.success
  ) {
    results.push(urlExtensionResult.value);
  }
  if (
    fileContentResult.status === "fulfilled" &&
    fileContentResult.value.success
  ) {
    results.push(fileContentResult.value);
  }

  if (results.length === 0) {
    return {
      extension: ".file",
      method: DetectionMethod.FILE_CONTENT,
      confidence: 0,
      success: false,
    };
  }

  // 投票机制：选择置信度最高的结果
  const bestResult = results.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  );

  // 如果有多个结果且置信度相近，进行一致性检查
  if (results.length > 1) {
    const consistentResults = results.filter(
      (r) => r.extension === bestResult.extension
    );
    if (consistentResults.length > 1) {
      bestResult.confidence = Math.min(0.98, bestResult.confidence + 0.1); // 一致性加分
      console.log(
        `[${logID}] 多种方式检测一致: ${bestResult.extension}, 置信度提升至: ${bestResult.confidence}`
      );
    }
  }

  console.log(
    `[${logID}] 并发检测完成，最佳结果: ${bestResult.extension} (${bestResult.method}, 置信度: ${bestResult.confidence})`
  );
  return bestResult;
}

// 基于CDN策略的定制化检测
async function detectFileTypeByStrategy(
  url: string,
  context: any,
  logID: string,
  strategy: { strategy: string; fallback: string; confidence: number }
): Promise<DetectionResult> {
  console.log(
    `[${logID}] 使用CDN策略检测: ${strategy.strategy} -> ${strategy.fallback}`
  );

  let primaryResult: DetectionResult;
  let fallbackResult: DetectionResult;

  // 执行主要策略
  switch (strategy.strategy) {
    case "content_type_first":
      primaryResult = await detectByContentType(url, context, logID);
      break;
    case "url_extension_first":
      primaryResult = await detectByUrlExtension(url, logID);
      break;
    case "file_content_first":
      primaryResult = await detectByFileContent(url, context, logID);
      break;
    default:
      primaryResult = await detectByContentType(url, context, logID);
  }

  // 如果主要策略成功，返回结果
  if (primaryResult.success) {
    primaryResult.confidence = Math.min(
      0.98,
      primaryResult.confidence * strategy.confidence
    );
    return primaryResult;
  }

  // 执行备用策略
  switch (strategy.fallback) {
    case "content_type":
      fallbackResult = await detectByContentType(url, context, logID);
      break;
    case "url_extension":
      fallbackResult = await detectByUrlExtension(url, logID);
      break;
    case "file_content":
      fallbackResult = await detectByFileContent(url, context, logID);
      break;
    default:
      fallbackResult = await detectByUrlExtension(url, logID);
  }

  if (fallbackResult.success) {
    fallbackResult.confidence = Math.min(0.9, fallbackResult.confidence * 0.8); // 备用策略降低置信度
    return fallbackResult;
  }

  // 都失败了，返回默认结果
  return {
    extension: ".file",
    method: DetectionMethod.FILE_CONTENT,
    confidence: 0,
    success: false,
  };
}

// 使用 file-type 库检测文件类型
async function detectFileTypeFromBuffer(
  buffer: Uint8Array,
  logID?: string
): Promise<string> {
  try {
    const fileType = await fromBuffer(buffer);

    if (fileType && fileType.ext) {
      return `.${fileType.ext}`;
    }

    // 如果 file-type 无法识别，检查是否为文本文件
    const textChars = buffer.slice(0, 1024);
    let textCount = 0;
    for (let i = 0; i < textChars.length; i++) {
      const byte = textChars[i];
      if (
        (byte >= 32 && byte <= 126) ||
        byte === 9 ||
        byte === 10 ||
        byte === 13
      ) {
        textCount++;
      }
    }

    // 如果80%以上是可打印字符，认为是文本文件
    if (textCount / textChars.length > 0.8) {
      return ".txt";
    }

    return ".file"; // 未知类型
  } catch (error) {
    console.log(`[${logID || "unknown"}] 文件类型检测失败:`, error);
    return ".file";
  }
}

// 添加常用CDN域名白名单
basekit.addDomainList([
  // 阿里云CDN
  "alicdn.com",
  "aliyuncs.com",
  "oss-cn-beijing.aliyuncs.com",
  "oss-cn-shanghai.aliyuncs.com",
  "oss-cn-hangzhou.aliyuncs.com",
  "oss-cn-shenzhen.aliyuncs.com",
  "oss-cn-guangzhou.aliyuncs.com",
  "cdn.aliyuncs.com",
  "img-cn-beijing.aliyuncs.com",
  "img-cn-shanghai.aliyuncs.com",
  "img-cn-hangzhou.aliyuncs.com",
  "vod.aliyuncs.com",
  // 腾讯云CDN
  "myqcloud.com",
  "qcloudimg.com",
  "cos.ap-beijing.myqcloud.com",
  "cos.ap-shanghai.myqcloud.com",
  "cos.ap-guangzhou.myqcloud.com",
  "cdn.dnsv1.com",
  "image.myqcloud.com",
  "tencent-cloud.com",
  // 华为云CDN
  "huaweicloud.com",
  "myhuaweicloud.com",
  "obs.cn-beijing.myhuaweicloud.com",
  "obs.cn-shanghai.myhuaweicloud.com",
  "obs.cn-guangzhou.myhuaweicloud.com",
  // 金山云CDN
  "ksyun.com",
  "ksyuncs.com",
  "ksyuncdn.com",
  "ks3-cn-beijing.ksyuncs.com",
  "ks3-cn-shanghai.ksyuncs.com",
  // 七牛云CDN
  "qiniucdn.com",
  "qnssl.com",
  "clouddn.com",
  "qbox.me",
  // 又拍云CDN
  "upaiyun.com",
  "upyun.com",
  "upcdn.net",
  // 百度云CDN
  "bcebos.com",
  "baidubce.com",
  "baidu.com",
  // 网易云CDN
  "126.net",
  "163.com",
  // 微信CDN
  "qlogo.cn",
  "qpic.cn",
  "qq.com",
  // 微博CDN
  "sinaimg.cn",
  "weibocdn.com",
  "wp.com",
  // 抖音CDN
  "ixigua.com",
  "byteimg.com",
  // 小红书CDN
  "xhscdn.com",
  "xiaohongshu.com",
  // 哔哩哔哩CDN
  "bilivideo.com",
  "hdslb.com",
  "acgvideo.com",
  // YouTube CDN
  "googlevideo.com",
  "ytimg.com",
  "ggpht.com",
  // Facebook/Meta CDN
  "fbcdn.net",
  "facebook.com",
  "cdninstagram.com",
  // Twitter/X CDN
  "twimg.com",
  // AWS CloudFront
  "cloudfront.net",
  "amazonaws.com",
  "s3.amazonaws.com",
  // Cloudflare CDN
  "cloudflare.com",
  "cloudflare.net",
  "cdnjs.cloudflare.com",
  "imagedelivery.net",
  // Fastly CDN
  "fastly.com",
  "fastly.net",
  "fastly-insights.com",
  "fastlylb.net",
  // Akamai CDN
  "akamaized.net",
  "akamai.net",
  "akamaihd.net",
  "akamaiedge.net",
  // jsDelivr CDN
  "jsdelivr.net",
  "cdn.jsdelivr.net",
  // unpkg CDN
  "unpkg.com",
  // 字节跳动CDN
  "bytedance.com",
  // 抖音CDN
  "toutiao.com",
  "douyin.com",
  "tiktok.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-ak.com",
  "tiktokcdn.cn",
  "aweme.com",
  "amemv.com",
  "zjcdn.com",
  "bytedance-ads.com",
  "douyinpic.com",
  "iesdouyin.com",
  // 酷安CDN
  "kuaichuan.com",
  // 微博CDN
  "weibo.com",
  // 新浪CDN
  "sina.com",
  // 其他常用CDN
  "maxcdn.com",
  "bootstrapcdn.com",
  "googleapis.com",
  "gstatic.com",
  "githubassets.com",
  "github.io",
  "raw.githubusercontent.com",
]);
/**
 * 链接转附件字段捷径
 * 将包含链接的文本转换为附件格式
 */
basekit.addField({
  // 定义国际化语言资源
  i18n: {
    messages: {
      "zh-CN": {
        title: "链接转附件",
        urlLabel: "附件下载地址",
        placeholderUrl: "请输入附件下载地址",
        errorEmptyInput: "输入不能为空",
        errorNoUrl: "未找到有效的链接",
        convertSuccess: "链接转换成功",
        convertFailed: "链接转换失败",
      },
      "en-US": {
        title: "Link to Attachment",
        urlLabel: "Attachment download address",
        placeholderUrl: "Please enter the attachment download address",
        errorEmptyInput: "Input cannot be empty",
        errorNoUrl: "No valid links found",
        convertSuccess: "Link conversion successful",
        convertFailed: "Link conversion failed",
      },
      "ja-JP": {
        title: "リンクから添付ファイルへ",
        urlLabel: "添付ファイルのダウンロードアドレス",
        placeholderUrl: "添付ファイルのダウンロードアドレスを入力",
        errorEmptyInput: "入力が空です",
        errorNoUrl: "有効なリンクが見つかりません",
        convertSuccess: "リンク変換成功",
        convertFailed: "リンク変換失敗",
      },
    },
  },

  // 定义捷径的入参
  formItems: [
    {
      key: "urls",
      label: t("urlLabel"),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Text, FieldType.Url],
        placeholder: t("placeholderUrl"),
      },
      validator: {
        required: false,
      },
    },
  ],

  // 定义返回结果类型为附件字段
  resultType: {
    type: FieldType.Attachment,
  },

  // 执行函数
  execute: async function (
    formItemParams: {
      urls: string;
    },
    context: FieldContext
  ) {
    const logID = context.logID;
    try {
      console.log(`[${logID}] 开始执行链接转附件处理`);
      console.log(`[${logID}] 接收到的参数`, formItemParams);

      // 检查必要参数
      const { urls } = formItemParams;

      console.log(`[${logID}] 处理参数`, {
        urls,
      });

      // 检查 urls 是否为空
      if (!urls) {
        console.error(`[${logID}] 输入参数为空`);
        return {
          code: FieldCode.Success,
          data: [],
          message: t("errorEmptyInput"),
        };
      }

      let textContent = "";

      // 处理输入的文本内容
      if (Array.isArray(urls) && urls.length > 0) {
        textContent = urls.map((item: any) => item.text || item).join(" ");
      } else if (typeof urls === "string") {
        textContent = urls;
      }

      console.log(`[${logID}] 提取的文本内容:`, textContent);

      // 使用正则表达式提取链接
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundUrls = textContent.match(urlRegex);

      if (!foundUrls || foundUrls.length === 0) {
        console.error(`[${logID}] 未找到有效的链接`);
        return {
          code: FieldCode.Success,
          data: [],
          message: t("errorNoUrl"),
        };
      }

      // 如果链接数量超过5个，只取前5个
      const limitedUrls = foundUrls.slice(0, 5);
      console.log(`[${logID}] 找到的链接:`, foundUrls);
      console.log(`[${logID}] 处理的链接（最多5个）:`, limitedUrls);

      // 将链接转换为附件格式
      const attachments = await Promise.all(
        limitedUrls.map(async (url, index) => {
          // 从URL中提取文件名，如果没有则使用默认名称
          let fileName = "link_" + (index + 1);
          let fileExtension = "";

          try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const lastSegment = pathname.split("/").pop();
            const hostname = urlObj.hostname;

            // 根据域名获取最佳检测策略
            const strategy = getBestDetectionStrategy(hostname);

            let detectionResult: DetectionResult;

            // 根据用户配置选择检测模式
            const useConcurrentDetection = true; // 可以作为配置项

            if (useConcurrentDetection) {
              // 方案1: 并发检测所有方式
              detectionResult = await detectFileTypeConcurrently(
                url,
                context,
                logID
              );
            } else {
              // 方案2: 基于CDN策略的定制化检测
              detectionResult = await detectFileTypeByStrategy(
                url,
                context,
                logID,
                strategy
              );
            }

            fileExtension = detectionResult.extension || ".file";

            console.log(
              `[${logID}] 文件类型检测完成: ${fileExtension} (置信度: ${detectionResult.confidence})`
            );

            // 检查文件大小限制
            try {
              const headResponse = await context.fetch(url, {
                method: "HEAD",
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
                },
              });

              const contentLength = headResponse.headers.get("content-length");
              if (contentLength) {
                const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
                if (fileSizeInMB > 25) {
                  console.warn(
                    `[${logID}] 文件过大 (${fileSizeInMB.toFixed(2)}MB): ${url}`
                  );
                  return null; // 丢弃该链接
                }
              }
            } catch (headError) {
              console.warn(
                `[${logID}] 无法获取文件大小信息: ${url}`,
                headError
              );
            }

            // 如果仍然没有扩展名，使用默认值
            if (!fileExtension) {
              fileExtension = ".file";
            }

            // 生成文件名，避免重复扩展名
            if (lastSegment) {
              // 检查lastSegment是否已经有扩展名
              if (
                lastSegment.includes(".") &&
                lastSegment.toLowerCase().endsWith(fileExtension.toLowerCase())
              ) {
                // 如果已经有相同的扩展名，直接使用
                fileName = lastSegment;
              } else if (lastSegment.includes(".")) {
                // 如果有其他扩展名，替换为检测到的扩展名
                const nameWithoutExt = lastSegment.substring(
                  0,
                  lastSegment.lastIndexOf(".")
                );
                fileName = nameWithoutExt + fileExtension;
              } else {
                // 如果没有扩展名，添加检测到的扩展名
                fileName = lastSegment + fileExtension;
              }
            } else {
              // 如果没有lastSegment，使用默认名称
              fileName = "link_" + (index + 1) + fileExtension;
            }
          } catch (e) {
            console.warn(`[${logID}] 解析URL失败:`, url, e);
            fileName = "link_" + (index + 1) + ".file";
          }

          // 下载文件内容
          try {
            console.log(`[${logID}] 开始下载文件: ${url}`);
            const response = await context.fetch(url, {
              headers: {
                "User-Agent": "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
              },
            });

            if (!response.ok) {
              throw new Error(`下载失败: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // 检查文件大小
            const fileSizeInMB = arrayBuffer.byteLength / (1024 * 1024);
            if (fileSizeInMB > 25) {
              console.warn(
                `[${logID}] 文件过大 (${fileSizeInMB.toFixed(2)}MB): ${url}`
              );
              return null;
            }

            console.log(
              `[${logID}] 文件下载成功，大小: ${fileSizeInMB.toFixed(2)}MB`
            );

            // fileName已经在外层设置了，这里不需要重新设置
          } catch (downloadError) {
            console.warn(`[${logID}] 文件下载失败: ${url}`, downloadError);
            fileName = "link_" + (index + 1) + ".file";
          }

          return {
            name: fileName,
            content: url,
            contentType: "attachment/url",
          };
        })
      );

      // 过滤掉无效的链接（返回null的）
      const validAttachments = attachments.filter(
        (attachment) => attachment !== null
      );

      console.log(
        `[${logID}] 处理完成，有效附件数量: ${validAttachments.length}/${limitedUrls.length}`
      );

      console.log(`[${logID}] 生成的附件:`, attachments);

      return {
        code: FieldCode.Success,
        data: validAttachments,
        msg: t("convertSuccess"),
      };
    } catch (error) {
      console.error(`[${logID}] 处理过程中发生错误`, error);
      return {
        code: FieldCode.Success,
        data: [],
        msg: t("convertFailed"),
      };
    }
  },
});

export default basekit;
