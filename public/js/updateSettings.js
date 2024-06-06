//type is either data or password
const updateSettings = async (data, type) => {
    try {
        const token = localStorage.getItem('jwt'); // Retrieve the token from local storage
        const url = type === 'password' ? 'http://127.0.0.1:8080/api/v1/user/updateMyPassword' : 'http://127.0.0.1:8080/api/v1/user/updateMe'
        const res = await axios({
            method: 'PATCH',
            url,
            data,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });

        if (type === 'password') {
            const cookieOptions = {
                expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                path: '/',
            }

            document.cookie = (`jwt=${res.data.token}; expires=${cookieOptions.expires} httpOnly=${cookieOptions.httpOnly}; path=${cookieOptions.path};`);

        }

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated Successfully`)
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message)
    }
}


document.querySelector('.form-user-data').addEventListener('submit', e => {
    e.preventDefault()
    const form=new FormData()
    form.append('name',document.getElementById('name').value)
    form.append('email',document.getElementById('email').value)
    form.append('photo',document.getElementById('photo').files[0])
    // const email = document.getElementById('email').value
    // const name = document.getElementById('name').value
    // console.log(document.getElementById('photo').files[0])
    updateSettings(form, 'data')
})

document.querySelector('.form-user-password').addEventListener('submit', async (e) => {
    e.preventDefault()
    document.querySelector('.btn--save-password').textContent='Updating...'
    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password')

    document.querySelector('.btn--save-password').textContent='Save Password'
    document.getElementById('password-current').value=''
    document.getElementById('password').value=''
    document.getElementById('password-confirm').value=''
})