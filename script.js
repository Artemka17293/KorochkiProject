// Константы
const ADMIN_LOGIN = 'Admin';
const ADMIN_PASS = 'KorokNET';
const TEST_USER_LOGIN = 'user123';
const TEST_USER_PASS = '123456';

// Инициализация тестовых данных
if (!localStorage.getItem('requests')) {
    const testRequests = [
        { id: 1, user: 'user123', course: 'Основы Python', date: '2026-09-01', payment: 'Картой', status: 'Новая' },
        { id: 2, user: 'user123', course: 'Веб-дизайн', date: '2026-10-15', payment: 'Наличными', status: 'Идет обучение' },
        { id: 3, user: 'ivanov_ii', course: 'Менеджмент', date: '2026-08-20', payment: 'Перевод', status: 'Обучение завершено' }
    ];
    localStorage.setItem('requests', JSON.stringify(testRequests));
}

let currentUser = null;

// Функция валидации формы
function validateForm(formElement) {
    let isValid = true;
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    return isValid;
}

// Навигация
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('d-none'));
    document.getElementById(pageId).classList.remove('d-none');

    const nav = document.getElementById('mainNav');
    if (pageId === 'login-page' || pageId === 'register-page') {
        nav.classList.add('d-none');
    } else {
        nav.classList.remove('d-none');
    }

    if (pageId === 'requests-page') renderUserRequests();
    if (pageId === 'admin-page') renderAdminPanel();
}

// Авторизация
function handleLogin(e) {
    e.preventDefault();
    const loginInput = document.getElementById('loginUsername').value;
    const passInput = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');

    if (loginInput === ADMIN_LOGIN && passInput === ADMIN_PASS) {
        currentUser = { login: ADMIN_LOGIN, role: 'admin' };
        document.getElementById('adminLink').classList.remove('d-none');
        showPage('admin-page');
        return;
    }

    let isValid = false;
    let role = 'user';

    if (loginInput === TEST_USER_LOGIN && passInput === TEST_USER_PASS) {
        isValid = true;
    } else {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = storedUsers.find(u => u.login === loginInput && u.password === passInput);
        if (foundUser) {
            isValid = true;
        }
    }

    if (isValid) {
        currentUser = { login: loginInput, role: role };
        document.getElementById('adminLink').classList.add('d-none');
        errorBox.classList.add('d-none');
        showPage('requests-page');
    } else {
        errorBox.classList.remove('d-none');
    }
}

// Регистрация
function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    
    if (!validateForm(form)) {
        return;
    }

    const login = document.getElementById('regLogin').value;
    const password = document.getElementById('regPassword').value;
    const fio = document.getElementById('regFio').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.login === login)) {
        alert('Такой логин уже занят!');
        return;
    }

    users.push({ login, password, fio, phone, email });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Регистрация успешна! Теперь войдите.');
    showPage('login-page');
    
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });
}

function logout() {
    currentUser = null;
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    showPage('login-page');
}

// Создание заявки
function createRequest(e) {
    e.preventDefault();
    const course = document.getElementById('reqCourseName').value;
    const date = document.getElementById('reqDate').value;
    const payment = document.getElementById('reqPayment').value;

    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    
    const newReq = {
        id: Date.now(),
        user: currentUser.login,
        course: course,
        date: date,
        payment: payment,
        status: 'Новая'
    };

    requests.push(newReq);
    localStorage.setItem('requests', JSON.stringify(requests));

    alert('Заявка успешно отправлена!');
    e.target.reset();
    showPage('requests-page');
}

// Отображение заявок пользователя
function renderUserRequests() {
    const tbody = document.getElementById('userRequestsTableBody');
    tbody.innerHTML = '';
    
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const myRequests = allRequests.filter(r => r.user === currentUser.login);

    if (myRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">У вас пока нет заявок.</td></tr>';
        return;
    }

    myRequests.forEach(req => {
        let badgeClass = 'bg-secondary';
        if (req.status === 'Идет обучение') badgeClass = 'bg-primary';
        if (req.status === 'Обучение завершено') badgeClass = 'bg-success';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.course}</td>
            <td>${req.date}</td>
            <td>${req.payment}</td>
            <td><span class="badge ${badgeClass}">${req.status}</span></td>
            <td>
                ${req.status === 'Обучение завершено' ? 
                  '<button class="btn btn-sm btn-outline-success" onclick="leaveReview(this)">Оставить отзыв</button>' : 
                  '<span class="text-muted small">Недоступно</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function leaveReview(btn) {
    const review = prompt("Введите ваш отзыв о качестве образовательных услуг:");
    if (review) {
        alert("Спасибо за отзыв! Он отправлен модераторам.");
        btn.disabled = true;
        btn.innerText = "Отзыв отправлен";
    }
}

// Панель администратора
function renderAdminPanel() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';
    
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests.forEach((req, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.id}</td>
            <td>${req.user}</td>
            <td>${req.course}</td>
            <td>${req.date}</td>
            <td><strong>${req.status}</strong></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="changeStatus(${index}, 'Идет обучение')">Учится</button>
                    <button class="btn btn-outline-success" onclick="changeStatus(${index}, 'Обучение завершено')">Завершено</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function changeStatus(index, newStatus) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests[index].status = newStatus;
    localStorage.setItem('requests', JSON.stringify(requests));
    renderAdminPanel();
}

// Инициализация
window.onload = function() {
    showPage('login-page');
};
