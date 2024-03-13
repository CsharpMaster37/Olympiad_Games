document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    fetch('/signin', {
      method: 'POST',
      body: new FormData(this)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Перехватил: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      // Обрабатываем полученные данные
      console.log('Полученные данные:', data);
    })
    .catch(error => {
      // Обрабатываем ошибку
      console.error('Произошла ошибка:', error);
    });
  });