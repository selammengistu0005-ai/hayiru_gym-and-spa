const CACHE_NAME = "hiruy-reels-cache-v1";

const VIDEO_URLS = [
  "https://res.cloudinary.com/dhoymhers/video/upload/v1785405912/hiruy_gym_tiktok_2_rk5fif.mp4",
  "https://res.cloudinary.com/dhoymhers/video/upload/v1785406095/hiruy_gym_tiktok_1_uvyoaa.mp4",
  "https://res.cloudinary.com/dhoymhers/video/upload/v1785406106/hiruy_gym_tiktok_3_yzqeyx.mp4",
  "https://res.cloudinary.com/dhoymhers/video/upload/v1785406124/hiruy_gym_tiktok_4_v3lj0o.mp4",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const isReelVideo = VIDEO_URLS.includes(url);

  if (!isReelVideo) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
    )
  );
});