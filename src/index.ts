import {
  basekit,
  FieldType,
  field,
  FieldComponent,
  FieldCode,
  FieldContext,
} from "@lark-opdev/block-basekit-server-api";
import { fileTypeFromBuffer } from "file-type";

const { t } = field;

// 使用 file-type 库检测文件类型
async function detectFileTypeFromBuffer(
  buffer: Uint8Array,
  logID?: string
): Promise<string> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);

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

            // 文件扩展名获取逻辑
            let fileExtension = "";
            let useHeadRequest = true;
            let useUrlExtraction = false;
            let useFileDownload = false;

            // 优先级1: 通过HEAD请求获取文件信息
            try {
              const headResponse = await context.fetch(url, {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
                },
              });

              const contentType =
                headResponse.headers.get("content-type") || "";
              const contentLength = headResponse.headers.get("content-length");

              console.log(
                `[${logID}] URL: ${url}, Content-Type: ${contentType}, Content-Length: ${contentLength}`
              );

              // 检查文件大小，如果超过25MB则丢弃
              if (contentLength) {
                const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
                if (fileSizeInMB > 25) {
                  console.warn(
                    `[${logID}] 文件过大 (${fileSizeInMB.toFixed(2)}MB): ${url}`
                  );
                  return null; // 丢弃该链接
                }
              }

              // 根据Content-Type确定文件扩展名
              const commonTypes = {
                "text/html": ".html",
                "application/pdf": ".pdf",
                "image/jpeg": ".jpg",
                "image/jpg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp",
                "image/svg": ".svg",
                "application/json": ".json",
                "text/plain": ".txt",
                "text/css": ".css",
                "application/javascript": ".js",
                "text/javascript": ".js",
                "application/zip": ".zip",
                "application/x-rar": ".rar",
                "video/mp4": ".mp4",
                "video/webm": ".webm",
                "audio/mpeg": ".mp3",
                "audio/wav": ".wav",
                "application/msword": ".doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  ".docx",
                "application/vnd.ms-excel": ".xls",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  ".xlsx",
              };

              // 检查是否为常用类型
              let foundCommonType = false;
              for (const [mimeType, ext] of Object.entries(commonTypes)) {
                if (contentType.includes(mimeType)) {
                  fileExtension = ext;
                  foundCommonType = true;
                  break;
                }
              }

              if (!foundCommonType) {
                useUrlExtraction = true;
              }
            } catch (headError) {
              console.warn(`[${logID}] HEAD请求失败: ${url}`, headError);
              useUrlExtraction = true;
            }

            // 优先级2: 从URL路径中提取文件扩展名
            if (useUrlExtraction) {
              if (lastSegment && lastSegment.includes(".")) {
                const urlExtension = lastSegment.substring(
                  lastSegment.lastIndexOf(".")
                );
                const commonExtensions = [
                  ".html",
                  ".pdf",
                  ".jpg",
                  ".jpeg",
                  ".png",
                  ".gif",
                  ".webp",
                  ".svg",
                  ".json",
                  ".txt",
                  ".css",
                  ".js",
                  ".zip",
                  ".rar",
                  ".mp4",
                  ".webm",
                  ".mp3",
                  ".wav",
                  ".doc",
                  ".docx",
                  ".xls",
                  ".xlsx",
                ];

                if (commonExtensions.includes(urlExtension.toLowerCase())) {
                  fileExtension = urlExtension.toLowerCase();
                } else {
                  useFileDownload = true;
                }
              } else {
                useFileDownload = true;
              }
            }

            // 优先级3: 下载文件到内存并判断类型
            if (useFileDownload) {
              try {
                console.log(`[${logID}] 尝试下载文件进行类型检测: ${url}`);
                const downloadResponse = await context.fetch(url, {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (compatible; LinkToAttachment/1.0)",
                  },
                });

                if (!downloadResponse.ok) {
                  throw new Error(`下载失败: ${downloadResponse.status}`);
                }

                // 检查Content-Length
                const contentLength =
                  downloadResponse.headers.get("content-length");
                if (contentLength) {
                  const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
                  if (fileSizeInMB > 25) {
                    console.warn(
                      `[${logID}] 下载时发现文件过大 (${fileSizeInMB.toFixed(
                        2
                      )}MB): ${url}`
                    );
                    return null; // 丢弃该链接
                  }
                }

                // 读取文件内容到内存
                const arrayBuffer = await downloadResponse.arrayBuffer();
                const fileSizeInMB = arrayBuffer.byteLength / (1024 * 1024);

                if (fileSizeInMB > 25) {
                  console.warn(
                    `[${logID}] 下载完成后发现文件过大 (${fileSizeInMB.toFixed(
                      2
                    )}MB): ${url}`
                  );
                  return null; // 丢弃该链接
                }

                // 通过文件头判断文件类型
                const uint8Array = new Uint8Array(arrayBuffer);
                fileExtension = await detectFileTypeFromBuffer(
                  uint8Array,
                  logID
                );
              } catch (downloadError) {
                console.warn(`[${logID}] 文件下载失败: ${url}`, downloadError);
                fileExtension = ".file"; // 使用默认扩展名
              }
            }

            // 如果仍然没有扩展名，使用默认值
            if (!fileExtension) {
              fileExtension = ".file";
            }

            fileName = (lastSegment || "link_" + (index + 1)) + fileExtension;
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
