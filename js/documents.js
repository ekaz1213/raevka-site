// js/documents.js — версия с ссылками (без файлов), без inline onclick
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from './firebase.js';

const uploadForm = document.getElementById('upload-doc-form');
const pendingList = document.getElementById('pending-docs-list');
const docMsg = document.getElementById('doc-msg');

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

      docMsg.textContent = 'Документ успешно добавлен и ожидает проверки!';
      uploadForm.reset();
      setTimeout(() => docMsg.textContent = '', 4000);
    } catch (err) {
      alert('Ошибка добавления: ' + err.message);
    }
  });
}

// Загрузка документов на проверку для РКН
export async function loadPendingDocuments() {
  if (!pendingList) return;

  pendingList.innerHTML = '<p style="text-align:center; color:#666;">Загрузка документов на проверке...</p>';

  try {
    const q = query(collection(db, "documents"), where("status", "==", "new"));
    const snapshot = await getDocs(q);
    pendingList.innerHTML = '';

    if (snapshot.empty) {
      pendingList.innerHTML = '<p style="text-align:center; color:#666;">Нет документов на проверке</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = 
        <h4>${data.title}</h4>
        <p><small>Добавил: ${data.uploadedByEmail || '—'} • ${data.createdAt?.toDate().toLocaleDateString('ru-RU') || '—'}</small></p>
        <p>
          <a href="${data.url}" target="_blank" class="btn btn-primary" style="margin-right:1rem;">Открыть документ</a>
          <button class="btn btn-success approve-btn">Одобрить</button>
          <button class="btn btn-warning archive-btn">В архив</button>
        </p>
      ;

      card.querySelector('.approve-btn').addEventListener('click', () => approveDocument(id));
      card.querySelector('.archive-btn').addEventListener('click', () => archiveDocument(id));

      pendingList.appendChild(card);
    });
  } catch (err) {
    pendingList.innerHTML = '<p style="color:#ef4444; text-align:center;">Ошибка загрузки</p>';
    console.error(err);
  }
}

async function approveDocument(id) {
  if (!confirm('Одобрить документ?')) return;
  try {
    await updateDoc(doc(db, "documents", id), {
      status: 'approved',
      checkedBy: auth.currentUser.uid,
      checkedAt: serverTimestamp()
    });
    alert('Документ одобрен!');
    pendingList.innerHTML = '';
    loadPendingDocuments();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}

async function archiveDocument(id) {
  if (!confirm('Отправить в архив?')) return;
  try {
    await updateDoc(doc(db, "documents", id), {
      status: 'archived'
    });
    alert('Документ в архиве');
    pendingList.innerHTML = '';
    loadPendingDocuments();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}
