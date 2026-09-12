# Lumina — Salla Twilight theme

A custom [Salla](https://salla.dev) Twilight theme built on Salla's reference theme
([theme-raed](https://github.com/SallaApp/theme-raed)), with an extended single-product
page.

The upstream theme is kept as a git remote, so platform updates can be merged in:

```bash
git fetch upstream && git merge upstream/master
```

## What's custom

The product page mixes native Salla data with custom merchant-editable sections. Nothing
on the page is hard-coded content.

| # | Section | Source |
|---|---------|--------|
| 1 | Header | Native global header |
| 2 | Image gallery | Native `product.images` via `<salla-slider type="thumbs">` |
| 3 | Title / price / rating | Native `product.name`, `product.sale_price`, `product.rating` |
| 4 | Variant selector | Native `product.options` via `<salla-product-options>` |
| 5 | Quantity + Add to cart | Native `<salla-quantity-input>` + `<salla-add-product-button>` |
| 6 | **Trust badges** | Custom — `lumina_badges` |
| 7 | Description | Native `product.description` |
| 8 | **How-to-use steps** | Custom — `lumina_howto_steps` |
| 9 | **Testimonial** | Custom — `lumina_testimonial_*` |
| 10 | **Shape guide** | Custom UI bound to **native** `product.options` |
| 11 | **Comparison table** | Custom — `lumina_compare_rows` |
| 12 | **Tutorial video** | Custom — `lumina_video_url` |
| 13 | **Lifestyle photos** | Custom — `lumina_gallery_images`, falls back to `product.images` |
| 14 | **FAQ** | Custom — `lumina_faq_items` |
| 15 | Related products | Native `<salla-products-slider source="related">` |
| 16 | Footer | Native global footer |

Bold rows are editable from **Salla dashboard → Theme → Customize**. Every custom section
renders nothing until it has content, so an unconfigured store falls back to the stock
product page rather than showing empty boxes.

### The shape guide is not decorative

Tiles are rendered from real `product.options[].details[]` entries. Clicking one drives
the matching control inside the live `<salla-product-options>` form and dispatches a
`change`, so the price and selected variant update exactly as via the native selector
(`src/assets/js/partials/shape-guide.js`).

Bind it to a product option by entering that option's name in **اسم خيار المنتج المرتبط**.
Left empty, it uses the first option of type `image`/`thumbnail`. Products without a
matching option don't render the section.

## Upgrade safety

Custom markup lives in `src/views/components/product/`, not in core templates.
`src/views/pages/product/single.twig` differs from upstream by **three lines** — two
`{% include %}` statements placed at existing hook points, and one comment:

| Hook | Injected |
|------|----------|
| `product:single.description.end` | `trust-badges.twig` (inside the product column, under Add to Cart) |
| `product.single.before_customer_reviews` | `custom-sections.twig` (full width, above native reviews) |

The `{% hook %}` tags themselves are left in place, so content injected by Salla apps
still renders.

### Why settings rather than product metadata

Twig can only see `product.has_metadata` — the `<salla-metadata>` web component fetches
and renders its own content client-side, so per-product metadata values can't be read
into a custom layout server-side. Custom content is therefore driven by `twilight.json`
customizer settings. Native `<salla-metadata>` still renders in its stock position for
merchants who use it.

## Local development

Requires Node `^22.18.0 || >=24.11.0` and pnpm `>=10`.

```bash
pnpm install
pnpm run watch        # development build, rebuilds on change
pnpm run production   # minified build into public/
```

> This machine has Node 22.13.1 at `/usr/local/bin/node`, which is below the theme's
> engine floor. Homebrew's Node (`/opt/homebrew/bin/node`) satisfies it — prefix build
> commands with `export PATH="/opt/homebrew/bin:$PATH"`, or put that directory ahead of
> `/usr/local/bin` in your shell profile.

## Previewing on a Salla demo store

```bash
salla login             # browser OAuth against a Salla Partners account
salla store create      # one-off: creates a demo store
salla theme preview     # serves this theme against that store
```

`salla theme doctor` checks the toolchain. Nothing here touches a live store until
`salla theme publish` is run deliberately.

## Layout

```
src/
├── assets/
│   ├── js/partials/shape-guide.js          # binds shape tiles to product options
│   └── styles/04-components/lumina-product.scss
└── views/
    ├── components/product/                 # all custom sections
    │   ├── custom-sections.twig            # composes the full-width stack
    │   ├── trust-badges.twig
    │   ├── how-to-use.twig
    │   ├── testimonial.twig
    │   ├── shape-guide.twig
    │   ├── comparison.twig
    │   ├── video.twig
    │   ├── lifestyle-photos.twig
    │   └── faq.twig
    └── pages/product/single.twig           # +3 lines vs upstream
```

Customizer settings are defined under `settings` in `twilight.json`, all prefixed
`lumina_`.
