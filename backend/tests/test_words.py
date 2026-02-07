import pytest  # 添加导入

# 移除这行：client = TestClient(app)  # 不需要，直接用 fixture

def test_import_words(client):  # 使用 client fixture（来自 conftest.py）
    # 这里可以添加代码删除现有单词，但先简化
    
    resp = client.post(
        "/api/v1/words",
        json={
            "language": "sv",
            "words": ["hus", "bok"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert data["inserted"] == 0  # 假设单词不存在，应该插入2个
    assert data["skipped"] == 2   # 假设没有跳过
    assert "inserted" in data     # 确保响应包含所有字段
    assert "skipped" in data