const logout = async (email, password) => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:8080/api/v1/user/logout',
      });
  
      const cookieOptions = {
        expires: new Date(Date.now()),
        httpOnly: true,
        path: '/'
      }
  
      document.cookie = (`jwt=logges-out; expires=${cookieOptions.expires} httpOnly=${cookieOptions.httpOnly}; path=${cookieOptions.path};`);
      localStorage.setItem('jwt', '');

      if (res.data.status === "success") {
        showAlert("success",'Logged out successfully')
        window.setTimeout(() => {
          location.assign('/');
        },1500)
      }
    } catch (err) {
      showAlert('error',err.response.data.message)
    }
  }

document.querySelector('.nav__el--logout').addEventListener('click',logout)