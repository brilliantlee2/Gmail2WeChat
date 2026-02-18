# Gmail2WeChat
Receiving gmail notification on Wechat.

# 在微信（WeChat）中接收 Gmail 新邮件提醒（企业微信 Webhook + Google Apps Script）

目标：通过 **企业微信机器人 Webhook** 把 Gmail 新邮件推送到企业微信（可在微信中接收），减少因网络原因错过邮件的情况。  
流程只需要 **两大步**：  
1) 获取企业微信 Webhook 链接  
2) 用 Google Apps Script 定时检查 Gmail 并推送到 Webhook

---

## 第一部分：获取企业微信 Webhook 链接（按视频操作）

参考视频 **5:00–6:30** 的步骤完成企业微信群机器人配置，并最终拿到 **Webhook URL**。  
完成后你会得到类似这样的链接（示例）：

```
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> 这个链接就是后面脚本里要填的 `WECOM_WEBHOOK_URL`。

---

## 第二部分：Google Apps Script 配置（Gmail → 企业微信推送）

### 1) 在 Google Apps Script 新建项目并粘贴代码

1. 打开 Apps Script：<https://script.google.com>  
2. 新建项目（空白项目）  
3. 把默认 `Code.gs` 里的内容清空  
4. 粘贴`Redirect.gz`中脚本代码  
5. 点击保存（项目名建议改成：`gmail-to-wecom`）

---

### 2) 修改参数

在脚本顶部找到并修改以下参数：

```js
const WECOM_WEBHOOK_URL = "WECOM_WEBHOOK_URL";
const LABEL = "INBOX";
const MAX_CHECK = 5;

参数说明：
    •   WECOM_WEBHOOK_URL：企业微信机器人 Webhook 链接（第一部分得到的 URL）
    •   LABEL：要监听的邮件标签（默认 INBOX）
    •   MAX_CHECK：每次最多检查多少封邮件（建议 5～20）

3) 首次手动运行一次（非常重要）

首次需要手动运行一次，用来完成 Google 授权（Gmail 权限 + 网络请求权限等）：
    1.  在函数下拉框选择：notifyWeComForNewEmails
    2.  点击运行 ▶️
    3.  第一次会弹授权：
    •   选择你的 Google 账号
    •   如果提示“未验证应用”：进入 高级 → 继续
    •   允许以下权限：
    •   读取 Gmail（GmailApp）
    •   访问脚本属性（PropertiesService）
    •   发起外部 HTTP 请求（UrlFetchApp）
    4.  运行成功后查看 Execution log，应看到类似：

````
Pushed: x
```
4) 设置定时触发器（自动检查新邮件）

脚本目前只是“能跑”，要做到自动推送，还需要添加触发器：
    1.  左侧点击 Triggers（触发器）
    2.  点击右下角 + Add Trigger
    3.  配置如下：
    •   Function to run：notifyWeComForNewEmails
    •   Deployment：Head
    •   Event source：Time-driven
    •   Type：Minutes timer
    •   Interval：Every 5 minutes（推荐先用 5 分钟）
    4.  保存

完成后脚本会 每 5 分钟检查一次新邮件，并推送到企业微信机器人，从而在微信中接收提醒。