function confirmDelete(userId) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        window.location.href = '/admin/' + userId + '/delete';
    }
}
