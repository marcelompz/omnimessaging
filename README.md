OmniBot — WhatsApp web extension & OmniFlow operator console
Extensión de navegador para WhatsApp Web construida sobre el framework WXT, diseñada para transformar la interfaz de mensajería en una terminal operativa omnicanal y consola de copiloto en tiempo real conectada a OmniFlow SaaS y su motor inteligente OmniBot.

🌟 Características Principales
🤖 Consola Central de OmniBot (Copiloto & Despachador):
Interruptor tri-estado por conversación: Activo, Pausado y Toma de Control Humano (HUMAN_TAKEOVER).
Detección automática de tipeo del operador para pausar el bot y evitar colisiones de mensajes.
Sugerencias de respuesta en tiempo real (Ghost Bot) con visualización de herramientas ejecutadas (stock, reservas, saldos).
👤 Ficha 360° del Cliente:
Detección automática del contacto por número normalizado E.164.
Consulta en vivo de RUC/CI, saldo deudor, cuenta corriente y notas internas del CRM.
Alta rápida de nuevos clientes con datos del chat pre-completados.
🛒 Catálogo Omnicanal, Presupuestos y POS:
Búsqueda de productos con stock multidepósito y precios de lista asignados al cliente.
Generador de presupuestos en 1 clic con inserción de texto formateado y enlaces de pago en el chat.
Emisión directa de órdenes en el Punto de Venta (POS) con enlace a recibo digital.
📅 Agenda de Citas y Recursos Físicos:
Selector de disponibilidad en vivo filtrado por profesional y locación (consultorio, sauna, cabina).
Compartición de franjas horarias libres y agendamiento asistido con enlaces a calendarios.
🎁 Fidelidad y Puntos:
Visualización de balance de puntos y canje inmediato como descuento en compras o presupuestos.
⚡ Respuestas Rápidas y Automatización Determinista:
Snippets y plantillas con atajos de teclado (/precios, /horarios, /cuenta) y macros dinámicas ({cliente.nombre}, {saldo_pendiente}).
🛡️ Aislamiento Seguro en Shadow DOM:
Renderizado encapsulado mediante createShadowRootUi de WXT con adoptedStyleSheets, garantizando cero colisiones de estilos con WhatsApp Web.

🛠️ Stack Tecnológico
Framework: WXT (Next-gen Web Extension Framework)
Plataforma: Manifest V3 (Chrome, Firefox, Edge, Safari)
Frontend: React 18 + TypeScript + Tailwind CSS (encapsulado en Shadow DOM)
Backend: OmniFlow SaaS (NestJS 10, Prisma ORM, PostgreSQL 15, Redis, BullMQ)
Almacenamiento Local: browser.storage.local con sincronización en segundo plano

📂 Estructura del Repositorio
omnibot/
├── package.json
├── tsconfig.json
├── wxt.config.ts
├── tailwind.config.ts
├── src/
│   ├── entrypoints/
│   │   ├── background.ts                # Service Worker (Auth, proxy de red, polling OmniBot)
│   │   ├── popup/                       # Modal de configuración de instancia y credenciales
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── whatsapp.content/            # Content script inyectado en WhatsApp Web
│   │       ├── index.tsx                # Montaje de Shadow DOM UI (WXT createShadowRootUi)
│   │       ├── App.tsx                  # Root del Side Panel y navegación por pestañas
│   │       └── style.css                # Estilos Tailwind compilados para Shadow DOM
│   ├── components/
│   │   ├── omnibot/                     # Control de estados, sugerencias IA y takeover
│   │   ├── customer/                    # Ficha 360°, deuda y alta rápida
│   │   ├── catalog/                     # Catálogo, carrito, cotizaciones y POS
│   │   ├── appointments/                # Calendario, profesionales y locaciones
│   │   ├── loyalty/                     # Consulta y canje de puntos
│   │   ├── marketing/                   # Sorteos y snippets de BioLinks
│   │   └── automation/                  # Respuestas rápidas con atajos (/comando)
│   ├── hooks/                           # Hooks de chat activo, clientes, catálogo y DOM
│   ├── services/                        # Clientes HTTP (apiClient), storage y manipulación DOM
│   ├── constants/                       # Selectores DOM aislados (selectors.ts)
│   └── types/                           # Modelos de TypeScript (cliente, orden, bot, cita)

🚀 Inicio Rápido y Desarrollo Local
Prerrequisitos
Node.js 18.x o superior
Gestor de paquetes pnpm (npm install -g pnpm)
Instalación de dependencias
pnpm install
Ejecución en Modo Desarrollo (HMR)
Para Google Chrome:
pnpm dev
Abre una instancia de Chrome con la extensión cargada y recarga en caliente activa.
Para Mozilla Firefox:
pnpm dev:firefox
Inicia Firefox Developer Edition o Firefox estándar con el complemento cargado temporalmente.

📦 Compilación y Generación de Paquetes de Producción
Para compilar y empaquetar los archivos listos para subir a las tiendas:
# Compilar y empaquetar bundle .zip para Chrome (Manifest V3)
pnpm wxt zip

# Compilar y empaquetar bundle .zip para Firefox (Manifest V3 con gecko.id)
pnpm wxt zip -b firefox
Los artefactos listos para publicar se generarán en:
.output/omnibot-<version>-chrome.zip
.output/omnibot-<version>-firefox.zip

🌐 Guía de Publicación y Distribución
1. Google Chrome Web Store
Acceso a la Consola: Ingresa a Chrome Developer Dashboard.
Registro de Desarrollador: Si es la primera vez, abona la tarifa única de $5 USD y completa el perfil de desarrollador.
Carga del Bundle:
Haz clic en "Nuevo elemento" y sube .output/omnibot-<version>-chrome.zip.
Metadatos y Gráficos:
Completa título, descripción detallada, categoría (Productividad o Herramientas para empresas) e idioma predeterminado (Español).
Sube icono de $128 \times 128$ px (PNG) y al menos 1 captura de pantalla de $1280 \times 800$ px mostrando el panel activo sobre WhatsApp Web.
Justificación de Permisos (Punto Crítico):
host_permissions (web.whatsapp.com): "Requerido para inyectar la consola operativa de OmniFlow y detectar el chat activo".
host_permissions (api.omniflow.*): "Requerido para consultar catálogo, agendamiento y orquestar OmniBot mediante el Service Worker".
storage: "Almacenamiento seguro de tokens de sesión y configuración multi-tenant del operador".
tabs: "Permite abrir facturas digitales y comprobantes de pago en nuevas pestañas".
Política de Privacidad: Provee el enlace a la política de privacidad oficial de OmniFlow declarando que no se recopilan ni comercializan conversaciones privadas.
Publicación: Haz clic en "Enviar para revisión" (aprobación estimada: 24 a 72 horas hábiles).

2. Mozilla Firefox Add-ons (AMO)
Acceso al Portal: Ingresa a Mozilla Add-ons Developer Hub con tu cuenta de Mozilla (registro gratuito).
Nuevo Envío:
Haz clic en "Enviar un nuevo complemento" (Submit a New Add-on).
Elige canal de distribución:
Listada (Pública): Disponible públicamente en el catálogo de AMO.
No listada (Privada / Corporativa): Mozilla firma digitalmente el archivo .xpi para que lo distribuyas de forma interna y exclusiva a tus clientes SaaS.
Subida del Paquete: Carga el archivo .output/omnibot-<version>-firefox.zip.
Validación de gecko.id: El sistema validará automáticamente la presencia de browser_specific_settings.gecko.id configurado en wxt.config.ts.
Auditoría de Código Fuente: Al tratarse de código transpilado por Vite/WXT, Mozilla solicitará adjuntar un archivo zip con el código fuente y las instrucciones de compilación (pnpm install && pnpm build:firefox).
Firma y Distribución: Tras la aprobación, se genera la versión final firmada lista para instalación.

🧪 Instalación Manual de Prueba (Modo Desarrollador)
En Google Chrome / Brave / Edge:
Navega a chrome://extensions/.
Activa el interruptor "Modo de desarrollador" (arriba a la derecha).
Haz clic en "Cargar descomprimida".
Selecciona el directorio .output/chrome-mv3.
En Mozilla Firefox:
Escribe en la barra de direcciones: about:debugging#/runtime/this-firefox.
Haz clic en "Cargar complemento temporal..." (Load Temporary Add-on...).
Selecciona el archivo manifest.json ubicado dentro de .output/firefox-mv3/ o el archivo .zip generado.
Verifica que la extensión figure activa en about:addons y abre https://web.whatsapp.com/ para iniciar pruebas.

📄 Licencia y Mantenimiento
Desarrollado para: Ecosistema SaaS de OmniFlow.
Licencia: Propietaria / Confidencial. Todos los derechos reservados.

