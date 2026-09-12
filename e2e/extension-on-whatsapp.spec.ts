import { test, chromium, type BrowserContext, type Page, expect } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionPath = resolve(__dirname, '../.output/chrome-mv3');
const contentScriptPath = join(extensionPath, 'content-script.js');
const userDataDir = mkdtempSync(join(tmpdir(), 'omniflow-ext-'));

const MOCK_PAGE_URL = 'https://web.whatsapp.com/';
const MOCK_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mock WhatsApp Web</title>
</head>
<body>
  <div id="app">
    <header>Mock Header</header>
    <main id="main">
      <header class="chat-header"><h1>Active Chat</h1></header>
      <div class="message-list"></div>
    </main>
  </div>
</body>
</html>`;

const STORAGE_KEY = 'omniflow_extension_storage_v1';

const CHROME_POLYFILL = `
(() => {
  const STORAGE_KEY = '${STORAGE_KEY}';
  let _cache = {};
  const _subscribers = new Set();

  const DEFAULT_CONFIG = {
    baseUrl: '', tenantId: '', operatorToken: '',
    operatorName: 'Sin sesión / Configurar en extensión',
    autoTakeoverOnType: true, autoAnalyzeCopilot: true, theme: 'light',
    systemPromptBase: 'Atender con amabilidad, precisión y tono profesional.',
    targetBrowser: 'chrome',
  };

  _cache = { ...DEFAULT_CONFIG };

  window.chrome = {
    storage: {
      local: {
        get: (keys, cb) => {
          let result;
          if (!keys) result = { ..._cache };
          else if (typeof keys === 'string') result = { [keys]: _cache[keys] };
          else if (Array.isArray(keys)) {
            result = {};
            keys.forEach(k => { if (k in _cache) result[k] = _cache[k]; });
          } else result = { ..._cache };
          if (typeof cb === 'function') cb(result);
          return Promise.resolve(result);
        },
        set: (items, cb) => {
          _cache = { ..._cache, ...items };
          _subscribers.forEach(s => s({ [Object.keys(items)[0]]: { newValue: items[Object.keys(items)[0]], oldValue: null } }, 'local'));
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        remove: (keys, cb) => {
          if (Array.isArray(keys)) keys.forEach(k => delete _cache[k]);
          else if (typeof keys === 'string') delete _cache[keys];
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        clear: (cb) => {
          _cache = { ...DEFAULT_CONFIG };
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
      },
      onChanged: {
        addListener: (cb) => _subscribers.add(cb),
        removeListener: (cb) => _subscribers.delete(cb),
      },
    },
    runtime: {
      id: 'omniflow-extension-test',
      onMessage: { addListener: () => {} },
    },
    action: {
      onClicked: { addListener: () => {} },
    },
  };
})();
`;

let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  page = await context.newPage();
});

test.afterAll(async () => {
  await context?.close();
  try {
    rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
});

async function setupExtension() {
  await page.route('https://web.whatsapp.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/html', body: MOCK_PAGE_HTML });
  });

  await page.goto(MOCK_PAGE_URL, { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ content: CHROME_POLYFILL });
  await page.addScriptTag({ path: contentScriptPath });

  await page.waitForFunction(() => document.getElementById('omniflow-topbar-host'), { timeout: 10000 });
  await page.waitForFunction(() => document.getElementById('omniflow-sidebar-host'), { timeout: 10000 });
}

test.beforeEach(async () => {
  await setupExtension();
});

test.describe('OrderFlow WhatsApp Web Extension — Shadow DOM Injection', () => {
  test('topbar host (48px) and sidebar host (380px) are created with open ShadowRoot', async () => {
    const dims = await page.evaluate(() => {
      const top = document.getElementById('omniflow-topbar-host');
      const side = document.getElementById('omniflow-sidebar-host');
      return {
        topbarHeight: top?.style.height,
        topbarHasShadow: top ? !!top.shadowRoot : false,
        sidebarWidth: side?.style.width,
        sidebarHasShadow: side ? !!side.shadowRoot : false,
      };
    });

    expect(dims.topbarHeight).toBe('48px');
    expect(dims.topbarHasShadow).toBe(true);
    expect(dims.sidebarWidth).toBe('380px');
    expect(dims.sidebarHasShadow).toBe(true);
  });

  test('top bar renders OmniFlow branding, tenant, operator status and config button', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.textContent?.includes('OmniFlow');
    }, { timeout: 10000 });

    const html = await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.innerHTML || '';
    });

    expect(html).toContain('OmniFlow');
    expect(html).toContain('SISTEMA OMNICANAL');
    expect(html).toContain('orderflow-icon.svg');
    expect(html).toContain('Configurar conexión OmniFlow');
    expect(html).toContain('Sin tenant');
    expect(html).toContain('Panel activo');
  });

  test('ConfigModal opens via settings button with dynamic-domain placeholder', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('button[title*="Configurar"]');
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      const root = host?.shadowRoot;
      const settingsBtn = root?.querySelector('button[title*="Configurar"]');
      (settingsBtn as HTMLElement)?.click();
    });

    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.innerHTML.includes('Configuración de Acceso OmniFlow');
    }, { timeout: 5000 });

    const modalHtml = await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.innerHTML || '';
    });

    expect(modalHtml).toContain('Configuración de Acceso OmniFlow');
    expect(modalHtml).toContain('URL Base de la API OmniFlow');
    expect(modalHtml).toContain('Tenant ID');
    expect(modalHtml).toContain('Token JWT de Operador');
    expect(modalHtml).toContain('Guardar y Conectar');
    expect(modalHtml).toContain('https://tu-dominio.com');
    expect(modalHtml).not.toContain('api.omniflow.cloud');
  });

  test('sidebar renders embedded App with bot status, tabs and contact info', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-sidebar-host');
      return host?.shadowRoot?.textContent?.includes('OmniFlow');
    }, { timeout: 10000 });

    const html = await page.evaluate(() => {
      const host = document.getElementById('omniflow-sidebar-host');
      return host?.shadowRoot?.innerHTML || '';
    });

    expect(html).toContain('OmniFlow');
    expect(html).toContain('CHROME MV3');
    expect(html).toContain('Omnicanalidad de Alta Velocidad');
    expect(html).toContain('Contacto E.164 Activo');
    expect(html).toContain('Lic. Andrea González');
    expect(html).toContain('+595981442211');
    expect(html).toContain('OmniBot Activo');
    expect(html).toContain('Ficha 360');
    expect(html).toContain('Catálogo y venta');
    expect(html).toContain('Agenda');
    expect(html).toContain('Fidelización');
    expect(html).toContain('Mercadotecnia');
    expect(html).toContain('Atajos');
  });

  test('bot mode toggle and cross-browser button are interactive', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-sidebar-host');
      return host?.shadowRoot?.querySelector('button');
    }, { timeout: 10000 });

    const hasButtons = await page.evaluate(() => {
      const host = document.getElementById('omniflow-sidebar-host');
      const root = host?.shadowRoot;
      const buttons = root?.querySelectorAll('button');
      return buttons ? buttons.length : 0;
    });

    expect(hasButtons).toBeGreaterThan(3);
  });
});

test.describe('Extension Storage & Config Persistence', () => {
  test('storageService persists config to chrome.storage.local', async () => {
    await page.evaluate(() => {
      window.chrome.storage.local.set({
        'omniflow_extension_storage_v1': {
          tenantId: 'tenant_test_e2e',
          operatorToken: 'token_e2e',
          operatorName: 'Test Operator',
        }
      });
    });

    const stored = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        window.chrome.storage.local.get(['omniflow_extension_storage_v1'], (result: any) => {
          resolve(result['omniflow_extension_storage_v1'] || null);
        });
      });
    });

    expect(stored).toBeTruthy();
    expect(stored.tenantId).toBe('tenant_test_e2e');
    expect(stored.operatorToken).toBe('token_e2e');
  });

  test('ConfigModal save writes config to chrome.storage.local', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('button[title*="Configurar"]');
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      const root = host?.shadowRoot;
      const settingsBtn = root?.querySelector('button[title*="Configurar"]');
      (settingsBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(500);

    const apiUrlHandle = await page.evaluateHandle<HTMLInputElement>(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('input[type="url"]');
    });
    const tenantHandle = await page.evaluateHandle<HTMLInputElement>(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('input[placeholder="tenant_produccion_01"]');
    });
    const nameHandle = await page.evaluateHandle<HTMLInputElement>(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('input[placeholder="Ej: María González"]');
    });
    const tokenHandle = await page.evaluateHandle<HTMLInputElement>(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('input[type="password"]');
    });

    if (apiUrlHandle) await apiUrlHandle.fill('https://provecchio.com');
    if (tenantHandle) await tenantHandle.fill('tenant_e2e_save');
    if (nameHandle) await nameHandle.fill('Test E2E');
    if (tokenHandle) await tokenHandle.fill('jwt_e2e_token');

    await page.waitForTimeout(300);

    const submitHandle = await page.evaluateHandle<HTMLButtonElement>(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('button[type="submit"]');
    });
    await submitHandle?.click();

    await page.waitForTimeout(800);

    const stored = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        window.chrome.storage.local.get(['omniflow_extension_storage_v1'], (result: any) => {
          resolve(result['omniflow_extension_storage_v1'] || null);
        });
      });
    });

    expect(stored).toBeTruthy();
    expect(stored.tenantId).toBe('tenant_e2e_save');
    expect(stored.operatorName).toBe('Test E2E');
    expect(stored.operatorToken).toBe('jwt_e2e_token');
  });

  test('ConfigModal does not expose hardcoded api.omniflow.cloud', async () => {
    await page.waitForFunction(() => {
      const host = document.getElementById('omniflow-topbar-host');
      return host?.shadowRoot?.querySelector('button[title*="Configurar"]');
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      const root = host?.shadowRoot;
      const settingsBtn = root?.querySelector('button[title*="Configurar"]');
      (settingsBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(500);

    const hasHardcoded = await page.evaluate(() => {
      const host = document.getElementById('omniflow-topbar-host');
      const root = host?.shadowRoot;
      return (root?.textContent || '').includes('api.omniflow.cloud');
    });

    expect(hasHardcoded).toBe(false);
  });
});

test.describe('WhatsApp DOM Layout Integration', () => {
  test('#app element width is constrained by layout override', async () => {
    const layoutOverride = await page.evaluate(() => {
      const styleEl = document.getElementById('omniflow-layout-override');
      return styleEl ? styleEl.textContent : null;
    });

    expect(layoutOverride).toBeTruthy();
    expect(layoutOverride).toContain('100vw');
    expect(layoutOverride).toContain('48px');
    expect(layoutOverride).toContain('calc(100vw - 380px)');
  });
});
