# 🚀 Guía de Deployment y DevOps

## Tabla de Contenidos
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Despliegue en Vercel](#despliegue-en-vercel)
3. [Despliegue en Netlify](#despliegue-en-netlify)
4. [Despliegue en AWS](#despliegue-en-aws)
5. [Despliegue en GCP](#despliegue-en-gcp)
6. [Monitoreo y Alertas](#monitoreo-y-alertas)
7. [CI/CD con GitHub Actions](#cicd-con-github-actions)
8. [Optimización para Producción](#optimización-para-producción)

---

## Pre-Deployment Checklist

### ✅ Código y Pruebas
- [ ] Code review completado
- [ ] Tests pasando: `npm test -- --coverage`
- [ ] Build completo sin errores: `npm run build`
- [ ] Lint check: `npm run lint` (si existe)
- [ ] No hay console.logs de debug en código

### ✅ Seguridad
- [ ] `.env` no está en Git
- [ ] `.gitignore` contiene `.env`
- [ ] No hay hardcoded secrets en código
- [ ] API keys rotadas (si es necesario)
- [ ] HTTPS habilitado en producción
- [ ] CORS configurado correctamente

### ✅ Configuración
- [ ] Variables de entorno definidas
- [ ] `REACT_APP_GROQ_API_KEY` configurada
- [ ] `REACT_APP_ENV=production`
- [ ] URLs de API son correctas
- [ ] Idioma y región configurados

### ✅ Performance
- [ ] Build size revisado: `npm run build` reporta tamaño
- [ ] Images optimizadas
- [ ] Code splitting funcionando
- [ ] Lazy loading implementado

### ✅ Compatibilidad
- [ ] Testear en navegadores objetivo:
  - [ ] Chrome (último 2 versiones)
  - [ ] Firefox (último 2 versiones)
  - [ ] Safari 14+
  - [ ] Edge (último 2 versiones)
- [ ] Responsive en móvil, tablet, desktop
- [ ] Micrófono funciona en dispositivos móviles

### ✅ Documentación
- [ ] Documentación actualizada
- [ ] README con instrucciones de setup
- [ ] CHANGELOG con cambios
- [ ] Detalles de contact para soporte

---

## Despliegue en Vercel (Recomendado)

### Ventajas
✅ Gratuito para proyectos open-source  
✅ Deployment automático en cada push  
✅ HTTPS automático  
✅ Preview URLs para PRs  
✅ Análisis de performance  
✅ Escalado automático  

### Paso 1: Preparar Repositorio

```bash
# Asegurar que todo está en Git
git add .
git commit -m "Listo para Vercel"
git push origin main
```

**Estructura esperada:**
```
clinica-chatbot/
├── package.json
├── src/
├── public/
├── .env.example (NO .env)
├── .gitignore (contiene .env)
└── README.md
```

### Paso 2: Conectar a Vercel

1. Ve a https://vercel.com/
2. Haz clic en "Sign Up" (si no tienes cuenta)
3. Selecciona "Continuar con GitHub"
4. Autoriza a Vercel acceso a tu GitHub
5. Haz clic en "Import Project"
6. Selecciona tu repositorio `clinica-chatbot`

### Paso 3: Configurar Proyecto

En la pantalla de configuración:

```
Framework Preset: ✓ Create React App
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### Paso 4: Variables de Entorno

En "Environment Variables":
```
REACT_APP_GROQ_API_KEY = gsk_xxxxx...
REACT_APP_ENV = production
```

**IMPORTANTE:** Nunca commits `.env` a Git. En Vercel, las variables se configuran en el dashboard.

### Paso 5: Desplegar

1. Haz clic en "Deploy"
2. Espera 2-5 minutos
3. Verás "Congratulations! Your site is live"
4. URL será: `https://clinica-chatbot.vercel.app`

### Paso 6: Configurar Dominio Personalizado (Opcional)

En Vercel Dashboard → Settings → Domains:
```
Dominio personalizado: clinica.ejemplo.com
```

Apuntar DNS a Vercel:
```
CNAME: cname.vercel-dns.com
```

### Redeployment Automático

Cada push a `main` redeploya automáticamente:

```bash
# Automático al push
git push origin main
# Vercel detecta cambios y redeploya
# En ~2 minutos tu site está actualizado
```

---

## Despliegue en Netlify

### Paso 1: Crear y Conectar

```bash
# Instalar CLI
npm install -g netlify-cli

# Autenticar
netlify login
```

### Paso 2: Configuración Inicial

```bash
# En tu proyecto
netlify init
```

Responder preguntas:
```
? Team: Tu equipo (o crear nuevo)
? Site name: clinica-chatbot
? Build command: npm run build
? Publish directory: build
```

Se creará archivo `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Paso 3: Variables de Entorno

Crear archivo `.env.production`:
```
REACT_APP_GROQ_API_KEY = gsk_xxxxx...
REACT_APP_ENV = production
```

O en Netlify Dashboard → Site Settings → Build & Deploy → Environment:
```
REACT_APP_GROQ_API_KEY = gsk_xxxxx...
```

### Paso 4: Desplegar

```bash
# Build local
npm run build

# Desplegar a producción
netlify deploy --prod --dir=build

# O solo previewu (sin publicar)
netlify deploy --dir=build
```

### Redeployment Automático

Conectar repositorio GitHub:
1. Netlify Dashboard → Site Settings → Build & Deploy
2. Click "Connect repository"
3. Seleccionar GitHub y `clinica-chatbot`
4. Configurar branch: `main` o `develop`

Ahora cada push redeploya automáticamente.

---

## Despliegue en AWS

### Opción A: AWS S3 + CloudFront (Recomendado)

#### Crear Bucket S3

```bash
# Crear bucket
aws s3 mb s3://clinica-chatbot-prod

# Permitir acceso público (para CloudFront)
aws s3api put-bucket-policy --bucket clinica-chatbot-prod \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clinica-chatbot-prod/*"
    }
  ]
}
```

#### Build y Deploy

```bash
# Build
npm run build

# Subir archivos a S3
aws s3 sync build/ s3://clinica-chatbot-prod/ \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html" \
  --exclude "service-worker.js"

# Archivos dinámicos sin cache
aws s3 cp build/index.html s3://clinica-chatbot-prod/ \
  --cache-control "max-age=0"
```

#### Crear CloudFront Distribution

```bash
# CloudFront actúa como CDN y cache
aws cloudfront create-distribution \
  --origin-domain-name clinica-chatbot-prod.s3.amazonaws.com \
  --default-root-object index.html
```

#### Configurar Invalidaciones

Para purgar cache después de desplegar:

```bash
# Invalidar todos los archivos
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

### Opción B: AWS Amplify (Más Fácil)

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Inicializar
amplify init

# Agregare deploy
amplify add hosting

# Desplegar
amplify publish
```

---

## Despliegue en GCP

### Cloud Run (Serverless)

#### Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass https://api.groq.com;
    }
}
```

#### Desplegar a Cloud Run

```bash
# Autenticar
gcloud auth login
gcloud config set project mi-proyecto-gcp

# Build con Cloud Build
gcloud builds submit --tag gcr.io/mi-proyecto-gcp/clinica-chatbot

# Deploy a Cloud Run
gcloud run deploy clinica-chatbot \
  --image gcr.io/mi-proyecto-gcp/clinica-chatbot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REACT_APP_GROQ_API_KEY=gsk_xxxxx
```

---

## Monitoreo y Alertas

### Google Analytics

```html
<!-- En public/index.html, antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Métricas Clave a Monitorear

```javascript
// En Chatbot.jsx, registrar eventos
import { logEvent } from './analytics';

// Rastrear uso de voz
const startListening = () => {
  logEvent('voice_recognition_started');
  // ...
};

// Rastrear mensajes
const sendMessage = async (text) => {
  logEvent('message_sent', { length: text.length });
  // ...
};

// Rastrear errores
const handleError = (error) => {
  logEvent('error_occurred', { 
    type: error.type,
    message: error.message 
  });
};
```

### Sentry para Monitoring de Errores

```bash
npm install @sentry/react
```

```javascript
// En index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/123456",
  environment: process.env.REACT_APP_ENV,
  tracesSampleRate: 0.1
});

export default Sentry.withProfiler(App);
```

---

## CI/CD con GitHub Actions

### Archivo: .github/workflows/deploy.yml

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
      
      - name: Run linter
        run: npm run lint --if-present
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

### Configurar Secrets en GitHub

1. Ve a tu repositorio → Settings → Secrets and variables → Actions
2. Crea estos secrets:
   - `GROQ_API_KEY`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## Optimización para Producción

### 1. Bundle Size

```bash
# Analizar size
npm install -D source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

**Objetivo:** Total < 500 KB (gzipped)

### 2. Code Splitting

```javascript
// Lazy load componentes grandes
const ChatHistory = React.lazy(() => import('./ChatHistory'));

<Suspense fallback={<Loading />}>
  <ChatHistory />
</Suspense>
```

### 3. Caché de Servicios

Crear `public/service-worker.js`:

```javascript
// Cachear assets estáticos
const CACHE_NAME = 'clinica-chatbot-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/App.css',
  '/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 4. Compresión GZIP

En `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_GROQ_API_KEY": "@groq_api_key"
  }
}
```

### 5. Headers de Seguridad

En `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'"
        }
      ]
    }
  ]
}
```

### 6. Optimización de Imágenes

```bash
npm install -D sharp
```

Script en `package.json`:

```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  }
}
```

---

## Rollback y Recuperación

### Vercel

```bash
# Despliegues anteriores disponibles automáticamente
# Dashboard → Deployments → Previous versions
# Click para revertir al anterior
```

### GitHub

```bash
# Revertir commit
git log --oneline
git revert <commit-hash>
git push origin main
```

### Manual S3 + CloudFront

```bash
# Restaurar de backup
aws s3 sync s3://backups/clinica-chatbot/ s3://clinica-chatbot-prod/

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

---

## Roadmap Operativo

```
SEMANA 1: Preparación
├── Setup inicial en Vercel
├── Tests y validaciones
└── Documentación completada

SEMANA 2: Beta
├── Despliegue en staging
├── Tests de UAT
└── Feedback de usuarios

SEMANA 3-4: Producción
├── Despliegue en prod
├── Monitoreo 24/7
├── Soporte técnico activo
└── Iteraciones según feedback

POST-LANZAMIENTO:
├── Mantenimiento continuo
├── Updates de seguridad
├── Métricas y analytics
└── Mejoras basadas en uso
```

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0
