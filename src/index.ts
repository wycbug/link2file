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

// 文件大小限制配置
const MAX_FILE_SIZE_MB = 10; // 最大文件大小限制（MB）
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 转换为字节

// 文件大小检查辅助函数
function isFileSizeExceeded(sizeInBytes: number): boolean {
  return sizeInBytes > MAX_FILE_SIZE_BYTES;
}

function formatFileSize(sizeInBytes: number): string {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return `${sizeInMB.toFixed(2)}MB`;
}

function getFileSizeErrorMessage(
  sizeInBytes: number,
  url: string,
  logID: string
): string {
  return `[${logID}] 文件过大 (${formatFileSize(
    sizeInBytes
  )}，限制${MAX_FILE_SIZE_MB}MB): ${url}`;
}

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

// 简化的检测结果接口
interface DetectionResult {
  extension: string;
  success: boolean;
}

// 简化的文件类型检测函数 - 直接下载文件并使用 file-type 检测
async function detectFileTypeSimplified(
  url: string,
  context: any,
  logID: string
): Promise<DetectionResult> {
  try {
    console.log(`[${logID}] 开始下载文件进行类型检测: ${url}`);

    // 直接下载完整文件到内存
    const response = await context.fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
      },
    });

    if (!response.ok) {
      console.warn(
        `[${logID}] 文件下载失败: ${response.status} ${response.statusText}`
      );
      return {
        extension: ".file",
        success: false,
      };
    }

    // 检查文件大小限制
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const fileSizeInBytes = parseInt(contentLength);
      if (isFileSizeExceeded(fileSizeInBytes)) {
        console.warn(getFileSizeErrorMessage(fileSizeInBytes, url, logID));
        return {
          extension: ".file",
          success: false,
        };
      }
    }

    // 获取文件内容
    const arrayBuffer = await response.arrayBuffer();
    const fileSizeInBytes = arrayBuffer.byteLength;

    // 再次检查实际文件大小
    if (isFileSizeExceeded(fileSizeInBytes)) {
      console.warn(getFileSizeErrorMessage(fileSizeInBytes, url, logID));
      return {
        extension: ".file",
        success: false,
      };
    }

    console.log(
      `[${logID}] 文件下载成功，大小: ${formatFileSize(fileSizeInBytes)}`
    );

    // 使用 file-type 库检测文件类型
    const uint8Array = new Uint8Array(arrayBuffer);
    const detectedExtension = await detectFileTypeFromBuffer(uint8Array, logID);

    if (detectedExtension && detectedExtension !== ".file") {
      console.log(`[${logID}] 文件类型检测成功: ${detectedExtension}`);
      return {
        extension: detectedExtension,
        success: true,
      };
    }

    // 如果 file-type 无法识别，尝试从 URL 获取扩展名作为备用
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastSegment = pathname.split("/").pop();

      if (lastSegment && lastSegment.includes(".")) {
        const urlExtension = lastSegment
          .substring(lastSegment.lastIndexOf("."))
          .toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(urlExtension)) {
          console.log(`[${logID}] 使用URL扩展名作为备用: ${urlExtension}`);
          return {
            extension: urlExtension,
            success: true,
          };
        }
      }
    } catch (urlError) {
      console.warn(`[${logID}] URL解析失败:`, urlError);
    }

    console.log(`[${logID}] 无法确定文件类型，使用默认扩展名`);
    return {
      extension: ".file",
      success: false,
    };
  } catch (error) {
    console.error(`[${logID}] 文件类型检测失败:`, error);
    return {
      extension: ".file",
      success: false,
    };
  }
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
  // 小红书CDN
  "xhscdn.com",
  "xiaohongshu.com",
  // 哔哩哔哩CDN
  "bilivideo.com",
  "hdslb.com",
  "acgvideo.com",
  // 快手 CDN
  "kuaishou.com",
  "kuaishoustatic.com",
  "kwaicdn.com",
  "kwimgs.com",
  "wsukwai.com",
  "yximgs.com",
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
  // 字节跳动系CDN
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
  "douyinvod.com",
  "ixigua.com",
  "byteimg.com",
  "douyinstatic.com",
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

            // 使用简化的文件类型检测
            const detectionResult = await detectFileTypeSimplified(
              url,
              context,
              logID
            );

            fileExtension = detectionResult.extension || ".file";

            console.log(`[${logID}] 文件类型检测完成: ${fileExtension}`);

            // 如果检测失败（文件过大或其他原因），跳过该链接
            if (!detectionResult.success) {
              return null;
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
