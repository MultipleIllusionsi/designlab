# Оптимизация медиа перед загрузкой в ImageKit

Как сжимать исходники так, чтобы детальная страница выглядела чётко, а трафик/вес были минимальными. Этим скриптом были сжаты файлы `design_lab_assets/original` → `design_lab_assets/compressed` (289 МБ → ~50 МБ, −82%).

## Логика (почему так)

- **Видео — главное.** ImageKit-трансформации видео мы НЕ используем: они биллятся по **длине оригинала** (не по обрезке) и выжигают free-лимит video units. Поэтому:
  - **Детальная:** сжатый оригинал через `orig-true` (0 юнитов), т.е. **вес исходника = вес трафика** → сжимаем агрессивно: даунскейл до **1080p** (длинная сторона ≤ 1920px), H.264, звук вырезаем (ролики немые).
  - **Сетка:** короткое **3-сек превью, сгенерированное локально** (ffmpeg, 640px), заливается в подпапку `previews/` и отдаётся тоже через `orig-true` (0 юнитов, ~10–150 КБ). ImageKit видео вообще не трансформирует → video units всегда 0.
- **Картинки — второстепенно.** Их ImageKit пережимает при отдаче сам (`w-900` для сетки, `w-2400` для детальной, авто-формат webp/avif). Поэтому вес исходной картинки влияет на **хранилище**, а не на трафик. Достаточно ограничить разрешение до **2560px** (запас над `w-2400`) и убрать лишний вес: JPG — quality 85, PNG — `pngquant` (сохраняет прозрачность и формат).
- **Расширения не меняем** (`.png` остаётся `.png`), иначе порвётся связь имени файла с карточкой в Sanity.

## Требования

```bash
# macOS: ffmpeg для видео, pngquant для PNG (sips уже встроен)
brew install ffmpeg pngquant
```

## Скрипт

Положи в `design_lab_assets/` и запусти из этой папки. Читает `original/`, пишет в `compressed/`, оригиналы не трогает.

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p compressed

CAP_VIDEO=1920   # длинная сторона видео (1080p-класс)
CAP_IMAGE=2560   # длинная сторона картинок
CRF=23           # качество видео: меньше = лучше/тяжелее (18–28 разумный диапазон)
JPG_Q=85         # качество JPEG
PNG_Q="65-88"    # диапазон качества pngquant

dim() { sips -g pixelWidth -g pixelHeight "$1" | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w, h}'; }

# ---- ВИДЕО: даунскейл ≤1080p, H.264, без звука, faststart ----
for f in original/*.mp4; do
  n=$(basename "$f")
  read w h <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$f" | tr 'x' ' ')"
  if   [ "$w" -ge "$h" ] && [ "$w" -gt "$CAP_VIDEO" ]; then vf=(-vf "scale=$CAP_VIDEO:-2")
  elif [ "$h" -gt "$w" ] && [ "$h" -gt "$CAP_VIDEO" ]; then vf=(-vf "scale=-2:$CAP_VIDEO")
  else vf=(); fi
  ffmpeg -y -loglevel error -i "$f" -an \
    -c:v libx264 -crf "$CRF" -preset slow -pix_fmt yuv420p -movflags +faststart \
    "${vf[@]}" "compressed/$n"
  echo "video  $n"
done

# ---- ГРИД-ПРЕВЬЮ: 3 сек, 640px, из compressed/ -> previews/ (для сетки) ----
mkdir -p previews
for f in compressed/*.mp4; do
  n=$(basename "$f")
  read w h <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$f" | tr 'x' ' ')"
  if [ "$w" -ge "$h" ]; then pvf="scale=640:-2"; else pvf="scale=-2:640"; fi
  ffmpeg -y -loglevel error -t 3 -i "$f" -an \
    -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart \
    -vf "$pvf" "previews/$n"
  echo "preview $n"
done

# ---- JPG: quality 85, cap 2560 ----
for f in original/*.jpg; do
  n=$(basename "$f"); read w h <<<"$(dim "$f")"; max=$((w>h?w:h))
  if [ "$max" -gt "$CAP_IMAGE" ]; then
    sips -Z "$CAP_IMAGE" -s format jpeg -s formatOptions "$JPG_Q" "$f" --out "compressed/$n" >/dev/null
  else
    sips -s format jpeg -s formatOptions "$JPG_Q" "$f" --out "compressed/$n" >/dev/null
  fi
  echo "jpg    $n"
done

# ---- PNG: pngquant (alpha сохраняется), cap 2560 ----
for f in original/*.png; do
  n=$(basename "$f"); read w h <<<"$(dim "$f")"; max=$((w>h?w:h))
  if [ "$max" -gt "$CAP_IMAGE" ]; then sips -Z "$CAP_IMAGE" "$f" --out "compressed/$n" >/dev/null
  else cp "$f" "compressed/$n"; fi
  # pngquant; если не влезает в качество — понижаем порог; если и так не вышло — оставляем даунскейл
  if   pngquant --quality="$PNG_Q" --strip --force --output "compressed/$n.tmp" "compressed/$n" 2>/dev/null; then mv "compressed/$n.tmp" "compressed/$n"
  elif pngquant --quality="45-88"  --strip --force --output "compressed/$n.tmp" "compressed/$n" 2>/dev/null; then mv "compressed/$n.tmp" "compressed/$n"
  fi
  echo "png    $n"
done

echo "Done. $(du -sh original | cut -f1) -> $(du -sh compressed | cut -f1)"
```

## Разовые команды (если нужно пережать один файл)

```bash
# видео -> 1080p, H.264, без звука
ffmpeg -i input.mp4 -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart output.mp4

# видео с даунскейлом (длинная сторона 1920)
ffmpeg -i input.mp4 -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -vf "scale='min(1920,iw)':-2" output.mp4

# JPG -> quality 85
sips -s format jpeg -s formatOptions 85 input.jpg --out output.jpg

# PNG -> pngquant (прозрачность сохраняется)
pngquant --quality=65-88 --strip --force --output output.png input.png
```

## Настройка качества

- Видео мыльное → уменьши `CRF` (например 20–21); тяжёлое → увеличь (24–25).
- Хочешь чуть чётче на детальной → подними `CAP_VIDEO` до 2560, но вес вырастет.
- **Всегда глазами проверь пару файлов** из `compressed/` перед заливкой (особенно шоурилы и градиентные 3D-рендеры).

## Что дальше — заливка в ImageKit

Заливаешь **две вещи** (с теми же именами):
1. **`compressed/*`** → в папку `ivi_design_lab/` (полные файлы для детальной + картинки).
2. **`previews/*`** → в подпапку `ivi_design_lab/previews/` (3-сек грид-превью видео).

`original/` держи локально как бэкап. Папка `design_lab_assets/` в `.gitignore`.

Всё отдаётся через `orig-true` → **0 video units** (ImageKit видео не трансформирует). Если превью какого-то видео не залито — сетка сама покажет полный ролик (фолбэк), сайт не сломается.
