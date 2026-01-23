// js/documents.js
import { db, storage, collection, addDoc, getDocs, query, where, updateDoc, doc, ref, uploadBytes, getDownloadURL, serverTimestamp } from './firebase.js';

const uploadForm = document.getElementById('upload-doc-form');
const pendingList = document.getElementById('pending-docs-list');

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('docTitle').value.trim();
    const file = document.getElementById('docFile').files[0];

    if (!file) {
      alert('Выберите файл!');
      return;
    }

    try {
      // Загрузка файла
      const storageRef = ref(storage, documents/${Date.now()}_${file.name});
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Сохранение в базу
      await addDoc(collection(db, "documents"), {
        title,
        fileUrl,
        status: 'new',
        uploadedBy: auth.currentUser.uid,
        uploadedByEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });

      alert('Документ загружен и ожидает проверки!');
      uploadForm.reset();
    } catch (err) {
      alert('Ошибка загрузки: ' + err.message);
    }
  });
}

// Загрузка документов на проверку (для РКН)
export async function loadPendingDocuments() {
  if (!pendingList) return;

  pendingList.innerHTML = '<p>Загрузка документов на проверку...</p>';

  try {
    const q = query(collection(db, "documents"), where("status", "==", "new"));
    const snapshot = await getDocs(q);

    pendingList.innerHTML = '';

    if (snapshot.empty) {
      pendingList.innerHTML = '<p style="color:#666;">Нет документов на проверке</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      pendingList.innerHTML += 
        <div class="card">
          <h4>${data.title}</h4>
          <p><small>Загружен: ${data.uploadedByEmail || '—'}</small></p>
          <p>
            <a href="${data.fileUrl}" target="_blank" class="btn btn-primary" style="margin-right:1rem;">Открыть документ</a>
            <button class="btn btn-success" onclick="approveDocument('${id}')">Одобрить</button>
            <button class="btn btn-danger" onclick="archiveDocument('${id}')">В архив</button>
          </p>
        </div>
      ;
    });
  } catch (err) {
    pendingList.innerHTML = '<p style="color:#ef4444;">Ошибка загрузки</p>';
    console.error(err);
  }
}

window.approveDocument = async function(id) {
  if (!confirm('Одобрить документ?')) return;
  try {
    await updateDoc(doc(db, "documents", id), {
      status: 'approved',
      checkedBy: auth.currentUser.uid,
      checkedAt: serverTimestamp()
    });
    alert('Документ одобрен!');
    loadPendingDocuments();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
};

window.archiveDocument = async function(id) {
  if (!confirm('Отправить в архив?')) return;
  try {
    await updateDoc(doc(db, "documents", id), {
      status: 'archived'
    });
    alert('Документ в архиве');
    loadPendingDocuments();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
};
