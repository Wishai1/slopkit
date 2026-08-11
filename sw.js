const CACHE_NAME = 'slopkit-offline-v2'; // Версия 2, чтобы браузер понял, что нужно обновить кэш

const urlsToCache = [
    './',
    './index.html',
    
    // Главная страница эксплойта
    './slopkit/poops.html?go=1&auto=1&trigger=netcontrol&payload=1&v=17',
    
    // Скрипты
    './slopkit/rop.js',
    './slopkit/main.js?v=16',
    './slopkit/syscalls.js',
    './slopkit/core.js?v=10',
    './slopkit/mem.js?v=10',
    './slopkit/int64.js',
    './slopkit/poops.js?v=16',
    './slopkit/rop_slave.js',
    
    // Медиафайлы
    './slopkit/cat.jpg',
    './slopkit/mmhmm-cats-ps5.gif',
    
    // Пейлоад
    './payloads/pldmgr-ps5.elf',

    // Оффсеты всех прошивок
    './offsets/9.60.js',
    './offsets/10.00.js',
    './offsets/10.01.js',
    './offsets/10.10.js',
    './offsets/10.20.js',
    './offsets/10.50.js',
    './offsets/10.70.js',
    './offsets/10.71.js',
    './offsets/11.00.js',
    './offsets/11.02.js',
    './offsets/11.50.js',
    './offsets/12.00.js',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    
    // Умное кэширование: не прерываемся, если файла оффсета нет на сервере
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[SW] Начинаю умное кэширование...');
            for (let url of urlsToCache) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    } else {
                        console.warn('[SW] Пропущен отсутствующий файл:', url);
                    }
                } catch (e) {
                    console.warn('[SW] Ошибка сети для:', url);
                }
            }
            console.log('[SW] Кэширование завершено');
        })
    );
});

self.addEventListener('activate', event => {
    // Автоматически чистим старые версии кэша
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Удаляю старый кэш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            console.error('[SW] Запрос не удался, файла нет в кэше:', event.request.url);
        })
    );
});
