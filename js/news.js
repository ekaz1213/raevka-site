// js/news.js
import { db, collection, getDocs, query, orderBy } from './firebase.js';

async function loadPublicNews() {
  const container = document.getElementById('news-list');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center; color:#666; font-size:1.2rem;">Загрузка новостей...</p>';

  try {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    container.innerHTML = '';

    if (snapshot.empty) {
      container.innerHTML = '<p style="text-align:center; color:#666; font-size:1.2rem;">Пока нет новостей</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const date = data.createdAt?.toDate().toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) || '—';

      container.innerHTML += 
        <div class="card">
          <h3>${data.title || 'Без заголовка'}</h3>
          <small style="color:#666; display:block; margin:0.8rem 0 1.2rem;">
            ${date} • ${data.authorName || 'Администрация'}
          </small>
          <p style="white-space: pre-wrap;">${data.text?.replace(/\n/g, '<br>') || ''}</p>
        </div>
      ;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color:#ef4444; text-align:center; font-size:1.2rem;">Ошибка загрузки новостей</p>';
  }
}

export { loadPublicNews };
