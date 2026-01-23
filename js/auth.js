// js/auth.js
import { auth, db, doc, getDoc, onAuthStateChanged, signOut } from './firebase.js';

let currentUser = null;
let userRole = 'resident'; // по умолчанию

// Проверка роли при загрузке любой защищённой страницы
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        userRole = data.role || 'resident';

        // Автоматически делаем первого пользователя (или указанных) админом
        if (['admin@raevka.ru', 'kazakov@gmail.com' /* добавь свои email-ы */].includes(user.email) && userRole !== 'admin') {
          await setDoc(doc(db, "users", user.uid), { role: 'admin' }, { merge: true });
          userRole = 'admin';
        }

        // Показываем нужные панели в cabinet.html
        const adminPanel = document.getElementById('admin-panel');
        const rknPanel = document.getElementById('rkn-panel');
        const residentPanel = document.getElementById('resident-panel');

        if (adminPanel && rknPanel && residentPanel) {
          adminPanel.style.display = userRole === 'admin' ? 'block' : 'none';
          rknPanel.style.display = userRole === 'rkn' ? 'block' : 'none';
          residentPanel.style.display = userRole === 'resident' ? 'block' : 'none';
        }

        // Обновляем ссылку на выход
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      }
    } catch (err) {
      console.error('Ошибка проверки роли:', err);
    }
  } else {
    // Не авторизован → на главную или логин
    if (window.location.pathname.includes('cabinet.html')) {
      window.location.href = 'login.html';
    }
  }
});

// Функция выхода
window.logout = async function() {
  await signOut(auth);
  window.location.href = 'index.html';
};
