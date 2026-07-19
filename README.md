# Meowmory

## PostgreSQL 本地启动

启动 PostgreSQL：

```bash
docker compose up -d postgres

# Redis 也会由同一个 compose 文件启动
docker compose up -d redis
```

配置后端数据库连接：

```bash
export MEOWMORY_DATABASE_URL='postgresql+psycopg2://meowmory:meowmory@localhost:5432/meowmory'
export MEOWMORY_JWT_SECRET='replace-with-a-long-random-secret'
export MEOWMORY_REDIS_URL='redis://localhost:6379/0'
```

首次迁移数据库：

```bash
cd backend
./venv/bin/alembic upgrade head
./venv/bin/uvicorn app.main:app --reload

# 另开一个终端启动 Celery worker，启用异步故事生成
./venv/bin/celery -A app.worker.celery_app.celery_app worker --loglevel=info
```

前端另开终端：

```bash
cd frontend
npm run dev
```

也可以复制 `backend/.env.example` 和 `frontend/.env.example` 作为配置模板。未设置数据库连接时，后端仍会使用本地 SQLite `backend/dev.db`，主要用于测试和快速开发。

Redis 可通过 `GET /health` 查看状态。普通故事列表和词库查询会优先读取 Redis 缓存；Redis 不可用时自动回退数据库。启用 Redis 后，可运行 `python scripts/benchmark_redis.py` 对比有无缓存的平均延迟、P50、P95。

## CI/CD

GitHub Actions 配置位于 `.github/workflows/ci.yml`，会在任意分支 push、Pull Request 和手动触发时运行：

- 使用 PostgreSQL 和 Redis 服务执行 Alembic 迁移、Python 编译检查和后端测试。
- 执行前端 `npm ci`、ESLint 和生产构建，并上传 `dist` 构建产物。
- 校验 `docker compose` 配置是否有效。

当前仓库没有指定生产部署平台，因此工作流不会自动发布到云服务器；绑定部署平台和密钥后，再在该工作流末尾增加部署 job 即可。

## 多语言约定

词汇和故事都必须带语言码，例如 `en`、`zh`、`sv`。词汇导入使用请求体中的 `language`，故事生成使用 `language`；前端的首页、词汇页、生成页都有语言选择器。用户自定义词汇只对当前用户可见，系统词汇按语言共享。
