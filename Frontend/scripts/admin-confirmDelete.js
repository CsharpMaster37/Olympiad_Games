function confirmDelete_user(userId) {
    // Открыть модальное окно
    document.getElementById('confirmationTitle').innerText = 'Подтверждение удаления пользователя';
    document.getElementById('confirmationMessage').innerText = 'Вы уверены, что хотите удалить этого пользователя?';
    
    // Установить обработчик события для кнопки подтверждения удаления
    document.getElementById('confirmDeleteButton').onclick = function() {
      // Перейти к удалению пользователя
      window.location.href = '/admin/' + userId + '/user_delete';
    };
  
    // Открыть модальное окно
    var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }

  function confirmDelete_progress_square(userId) {
    // Установить сообщение для подтверждения
    document.getElementById('confirmationTitle').innerText = 'Подтверждение удаления прогресса';
    document.getElementById('confirmationMessage').innerText = 'Вы уверены, что хотите удалить прогресс "Квадрата" этого пользователя?';
    
    // Установить обработчик события для кнопки подтверждения
    document.getElementById('confirmDeleteButton').onclick = function() {
      // Перейти к выполнению действия
      window.location.href = '/admin/' + userId + '/progress_delete_square';
    };
  
    // Открыть модальное окно
    var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }
  
  function confirmDelete_progress_carousel(userId) {
    // Установить сообщение для подтверждения
    document.getElementById('confirmationTitle').innerText = 'Подтверждение удаления прогресса';
    document.getElementById('confirmationMessage').innerText = 'Вы уверены, что хотите удалить прогресс "Карусели" этого пользователя?';
  
    // Установить обработчик события для кнопки подтверждения
    document.getElementById('confirmDeleteButton').onclick = function() {
      // Перейти к выполнению действия
      window.location.href = '/admin/' + userId + '/progress_delete_carousel';
    };
  
    // Открыть модальное окно
    var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }

  function confirmDelete_progress_carousel_all() {
    // Установить сообщение для подтверждения
    document.getElementById('confirmationTitle').innerText = 'Подтверждение удаления прогресса';
    document.getElementById('confirmationMessage').innerText = 'Вы уверены, что хотите удалить прогресс "Карусели" для каждого пользователя?';
  
    // Установить обработчик события для кнопки подтверждения
    document.getElementById('confirmDeleteButton').onclick = function() {
      // Перейти к выполнению действия
      window.location.href = '/admin/progress_delete_carousel_all';
    };
  
    // Открыть модальное окно
    var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }

  function confirmDelete_progress_square_all() {
    // Установить сообщение для подтверждения
    document.getElementById('confirmationTitle').innerText = 'Подтверждение удаления прогресса';
    document.getElementById('confirmationMessage').innerText = 'Вы уверены, что хотите удалить прогресс "Квадрата" для каждого пользователя?';
  
    // Установить обработчик события для кнопки подтверждения
    document.getElementById('confirmDeleteButton').onclick = function() {
      // Перейти к выполнению действия
      window.location.href = '/admin/progress_delete_square_all';
    };
  
    // Открыть модальное окно
    var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }

