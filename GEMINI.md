# AI 全局开发与安全合规规范 (AI Safety & Engineering Guidelines)

> **核心强制指令 (Highest Priority Mandate)**：
> 所有 AI 助手在协助编写、审查、调试或提交代码时，必须严格遵守以下关于机密凭证与 GitHub 代码上传的规范。

---

## 🔒 代码提交与 GitHub 推送安全审查准则 (Secret Leak Prevention)

在向 GitHub、GitLab、Gitee 等远程代码托管平台执行任何代码提交操作（包括但不限于 `git add`、`git commit`、`git push`、创建 PR、上传 Release）前，**必须无条件执行凭证安全自检**：

### 1. 绝对禁止明文凭据入库 (Zero Plaintext Secrets)
- **严禁硬编码**：严禁在源代码（如 `.ts`, `.tsx`, `.js`, `.py`, `.json`, `.yaml`, `.env` 等文件）中硬编码真实的 API Key、Access Token、私钥、OAuth Secret 或数据库密码。
- **典型敏感凭据格式示例**：
  - OpenAI / DeepSeek / Claude / Gemini API 密钥（如 `sk-...`, `AIzaSy...` 等）
  - 云厂商 AccessKey ID & SecretKey（AWS、阿里云、腾讯云等）
  - 数据库连接字符串（含明文账号密码）
  - 私钥与证书文件（`*.pem`, `*.key`, `id_rsa`, `*.pfx`）
  - GitHub / GitLab Personal Access Token (`ghp_...`, `glpat-...`)

### 2. 提交前自检三步法 (Pre-Commit Verification Routine)
每次执行 `git add`、`git commit` 或准备推送前，AI 必须自动或提醒执行：
1. **审查变更差异**：检查 `git status` 与 `git diff`，确认变动内容中没有测试时随手贴入的真实密钥。
2. **审查配置文件与忽略规则**：检查是否存在 `.env`、`.env.local`、`secrets.json` 等敏感文件，确保它们已被记录在 `.gitignore` 中，未被 Git 追踪。
3. **安全占位符替换**：如果示例或模板代码需要展示配置格式，必须使用标准占位符（如 `YOUR_API_KEY_HERE` 或 `sk-placeholder-do-not-commit`）。

### 3. 发现泄漏风险时的强制阻断动作 (Emergency Halt Protocol)
- **立即中断**：一旦在待提交或已暂存的文件中检测到真实密钥或疑似真实 Token，**必须立即停止执行 `git commit` 或 `git push`**。
- **主动告警**：明确告知用户：“⚠️ 安全拦截：在 `[文件路径:行号]` 检测到疑似包含真实 API Key/密钥。为保护您的财产与数据安全，已自动终止上传至 GitHub。”
- **安全处置协助**：指导并协助用户将密钥迁移到本地环境变量或受忽略的 `.env.local` / 本地数据库中，并确保 `.gitignore` 生效。

---

## 🛡️ 敏感文件忽略基准 (.gitignore Baseline)
确保项目中包含以下忽略项，防止意外追踪：
```gitignore
# 密钥与本地环境配置
.env
.env.*
!.env.example
secrets.*
*.pem
*.key
*.p12
*.pfx
credentials.json
```
