const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');

const pages = [
  {
    outputPath: path.join(distDir, 'sou-nutricionista', 'index.html'),
    title: 'NutriMeet para Nutricionistas',
    description: 'Cadastre seu perfil profissional e receba pacientes pela NutriMeet com consulta social de R$40.',
    url: 'https://nutrimeet.com.br/sou-nutricionista',
    image: 'https://nutrimeet.com.br/og-nutrimeet-nutritionist.jpg',
    imageType: 'image/jpeg',
    imageWidth: '1200',
    imageHeight: '630',
    imageAlt: 'Imagem da NutriMeet para nutricionistas parceiros',
  },
];

if (!fs.existsSync(indexPath)) {
  throw new Error(`Build output not found: ${indexPath}`);
}

const baseHtml = fs.readFileSync(indexPath, 'utf8');

for (const page of pages) {
  const html = applySocialTags(baseHtml, page);
  fs.mkdirSync(path.dirname(page.outputPath), { recursive: true });
  fs.writeFileSync(page.outputPath, html);
  console.log(`Generated social preview page: ${path.relative(rootDir, page.outputPath)}`);
}

function applySocialTags(html, page) {
  return html
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.url}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${page.description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${page.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.url}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${page.image}" />`)
    .replace(/<meta property="og:image:url" content="[^"]*" \/>/, `<meta property="og:image:url" content="${page.image}" />`)
    .replace(/<meta property="og:image:secure_url" content="[^"]*" \/>/, `<meta property="og:image:secure_url" content="${page.image}" />`)
    .replace(/<meta property="og:image:type" content="[^"]*" \/>/, `<meta property="og:image:type" content="${page.imageType}" />`)
    .replace(/<meta property="og:image:width" content="[^"]*" \/>/, `<meta property="og:image:width" content="${page.imageWidth}" />`)
    .replace(/<meta property="og:image:height" content="[^"]*" \/>/, `<meta property="og:image:height" content="${page.imageHeight}" />`)
    .replace(/<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${page.imageAlt}" />`)
    .replace(/<link rel="image_src" href="[^"]*" \/>/, `<link rel="image_src" href="${page.image}" />`)
    .replace(/<meta name="thumbnail" content="[^"]*" \/>/, `<meta name="thumbnail" content="${page.image}" />`)
    .replace(/<meta itemprop="image" content="[^"]*" \/>/, `<meta itemprop="image" content="${page.image}" />`)
    .replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${page.url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/s, `<meta name="twitter:description" content="${page.description}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${page.image}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
}
