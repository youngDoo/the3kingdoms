# 《三国里的一天》

给 5–8 岁孩子的三国故事，每本讲「三国里的一天」，3–4 分钟。

**站点**：https://youngdoo.github.io/the3kingdoms/

## 目录

```
index.html              书架（汇总页），由 tools/build_site.py 生成，不要手改
stories.json            全部故事的清单（由各本的 meta.json 汇总生成）
assets/                 全站共用
  series.css            设计令牌（配色/字体）—— 所有页面先加载它
  deck.css / deck.js    放映页引擎（翻页、讲稿层、配乐、下载、回书架）
  shelf.css             书架样式
s/<slug>/               一本故事，完全自包含
  index.html            放映页（引用 ../../assets/）
  meta.json             这一本的元数据（书架卡片的数据来源）
  pages/*.jpg           页面图，2000px
  audio/*.mp3           配乐（3 段，翻页自动切换）
  downloads/*           PPTX / A4 图卡 PDF / 讲稿
```

**加一本故事 = 加一个目录。** 书架是从 `s/*/meta.json` 汇总生成的，不用手改首页。

## 放映页操作

| 操作 | 键 |
|---|---|
| 翻页 | `← →` / 空格 / 点屏幕（左 35% 回退） |
| 看讲稿备注 | `N` |
| 配乐开关（默认开） | `M` 或点右上角 |
| 全屏 | `F` |
| 回书架 | `Esc` 或点左上角 |

手机支持左右滑动。

## 本地预览

```bash
python -m http.server 8000     # 然后打开 http://127.0.0.1:8000/
```

（直接双击 `index.html` 也能看，但 `file://` 下音频可能被浏览器策略拦。）

## 构建（在父目录 `04_three_kingdoms/` 里执行）

```bash
# 构建某一本
python tools/build_site.py --site site --project liubei-life
# 重建书架与清单
python tools/build_site.py --site site --shelf
```

## 史实分级

每本讲稿末尾附出处表，分三级：**正史原文** / **裴松之注等旁证** / **演义与后世形象**。
画面与讲稿正文以正史为准；演义元素一律标注，不含糊。
