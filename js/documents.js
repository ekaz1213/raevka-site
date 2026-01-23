// js/documents.js — версия с ссылками, без inline JS
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from './firebase.js';

const uploadForm = document.getElementById('upload-doc-form');
const pendingList = document.getElementById('pending-docs-list');

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('docTitle').value.trim();
    const url = document.getElementById('docUrl').value.trim();

    if (!url.startsWith('http')) {
      alert('Ссылка должна начинаться с http или https!');
      return;
    }

    try {
      await addDoc(collection(db, "documents"), {
        title,
        url,
        status: 'new',
        uploadedBy: auth.currentUser.uid,
        uploadedByEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });
      alert('Документ добавлен!');
      uploadForm.reset();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
}

export async function loadPendingDocuments() {
  if (!pendingList) return;

  pendingList.innerHTML = '<p style="text-align:center;">Загрузка...</p>';

  try {
    const q = query(collection(db, "documents"), where("status", "==", "new"));
    const snapshot = await getDocs(q);
    pendingList.innerHTML = '';

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = 
        <h4>${data.title}</h4>
        <p><small>Добавил: ${data.uploadedByEmail || '—'}</small></p>
        <p>
          <a href="${data.url}" target="_blank" class="btn btn-primary" style="margin-right:1rem;">Открыть</a>
          <button class="btn btn-success approve-btn">Одобрить</button>
          <button class="btn btn-danger archive-btn">В архив</button>
        </p>
      ;

      card.querySelector('.approve-btn').addEventListener('click', () => {
        if (confirm('Одобрить?')) {
          updateDoc(doc(db, "documents", id), { status: 'approved' });
          loadPendingDocuments();
        }
      });

      card.querySelector('.archive-btn').addEventListener('click', () => {
        if (confirm('В архив?')) {
          updateDoc(doc(db, "documents", id), { status: 'archived' });
          loadPendingDocuments();
        }
      });

      pendingList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}
