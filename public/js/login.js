const hideAlert=()=>{
  const el=document.querySelector('.alert')
  if(el) el.parentElement.removeChild(el)
}


const showAlert=(type,msg)=>{
  hideAlert()
  const markup=`<div class="alert alert--${type}">${msg}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin',markup)
  window.setTimeout(hideAlert,5000)
}
 
 const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8080/api/v1/user/login',
      data: {
        email,
        password
      }
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      path:'/',
    }

    localStorage.setItem('jwt', res.data.token);
    document.cookie = `jwt=${res.data.token}; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}; `;

    if (res.data.status === "success") {
      showAlert("success",'Logged in successfully')
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }

  } catch (err) {
    showAlert('error',err.response.data.message)
  }
}


//login click
document.querySelector('.form--login').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  console.log(email,password)
  login(email, password)
})








